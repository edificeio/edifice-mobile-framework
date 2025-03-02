import CookieManager from '@react-native-cookies/cookies';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import { getFormattedNumber, isMobileNumber, isValidNumber } from 'react-native-phone-number-input';

import {
  AccountType,
  IActivationPayload as ActivationPayload,
  AuthActiveAccount,
  AuthActiveAccountWithCredentials,
  AuthActiveAccountWithSaml,
  AuthActiveUserInfo,
  AuthActiveUserInfoRelative,
  AuthActiveUserInfoStudent,
  AuthCredentials,
  AuthFederationCredentials,
  AuthLoggedAccount,
  AuthPendingRedirection,
  AuthRequirement,
  AuthTokenSet,
  createActivationError,
  credentialsAreCustomToken,
  credentialsAreLoginPassword,
  credentialsAreSaml,
  ForgotMode,
  InitialAuthenticationMethod,
  LegalUrls,
  PlatformAuthContext,
  SessionPersistence,
  StructureNode,
  UserChild,
  UserChildren,
} from './model';
import { AccountError, AccountErrorCode } from './model/error';

import { I18n } from '~/app/i18n';
import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { OAuth2ErrorCode } from '~/framework/util/oauth2';
import { Storage } from '~/framework/util/storage';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';
import { initOAuth2, OAuth2RessourceOwnerPasswordClient, uniqueId, urlSigner } from '~/infra/oauth';

export interface IUserRequirements {
  forceChangePassword?: boolean;
  needRevalidateEmail?: boolean;
  needRevalidateTerms?: boolean;
  needRevalidateMobile?: boolean;
  needMfa?: boolean;
}

export interface IEntcoreMFAValidationInfos {
  state: IEntcoreMFAValidationState; // State of the current MFA code
  type: 'sms' | 'email'; // MFA validation type
  waitInSeconds: number; // Estimated number of seconds before code reaches cellphone or mailbox
}

export interface IEntcoreMFAValidationState {
  state: 'outdated' | 'pending' | 'valid'; // Validation state
  tries: number; // Number of remaining retries before code becomes outdated
  ttl: number; // Number of seconds remaining before expiration of the code
}

export interface IEntcoreMobileValidationInfos {
  displayName: string; // User display name
  firstName: string; // User first name
  lastName: string; // User last name
  mobile: string; // Current mobile of the user (possibly not verified)
  mobileState?: IEntcoreMobileValidationState | null; // State of the current mobile
  waitInSeconds: number; // Estimated number of seconds before code reaches cellphone
}

export interface IEntcoreMobileValidationState {
  pending?: string; // (optional) Current pending (or outdated) mobile being checked
  state: 'outdated' | 'pending' | 'valid'; // Validation state
  tries?: number; // (optional) Number of remaining retries before code becomes outdated
  ttl?: number; // (optional) Number of seconds remaining before expiration of the code
  valid: string; // (optional) Last known valid mobile (or empty string)
}

export interface IEntcoreEmailValidationInfos {
  displayName: string; // User display name
  email: string; // Current email address of the user (possibly not verified)
  emailState: IEntcoreEmailValidationState | null; // State of the current email address
  firstName: string; // User first name
  lastName: string; // User last name
  waitInSeconds: number; // Suggested time to wait for the validation email to be sent (platform configuration)
}

export interface IEntcoreEmailValidationState {
  pending?: string; // (optional) Current pending (or outdated) email address being checked
  state: 'unchecked' | 'outdated' | 'pending' | 'valid'; // Validation state
  tries?: number; // (optional) Remaining number of times a validation code can be typed in
  ttl?: number; // (optional) Seconds remaining for the user to type in the correct validation code
  valid: string; // Last known valid email address (or empty string)
}

export interface IAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo add other types here
}

export enum AccountTypeBackend {
  Student = 'Student',
  Relative = 'Relative',
  Teacher = 'Teacher',
  Personnel = 'Personnel',
  Guest = 'Guest',
}

export interface IUserInfoBackend {
  userId?: string;
  username?: string;
  login?: string;
  type?: AccountType;
  deletePending?: boolean;
  forceChangePassword?: boolean;
  needRevalidateTerms?: boolean;
  apps?: IEntcoreApp[];
  widgets?: IEntcoreWidget[];
  authorizedActions?: IAuthorizedAction[];
  firstName?: string;
  lastName?: string;
  uniqueId?: string;
  groupsIds?: string[];
  classes?: string[];
  children?: { [userId: string]: { lastName: string; firstName: string } };
  birthDate?: string;
  federated?: boolean;
}

export interface UserPrivateData {
  childrenStructure?: {
    structureName: string;
    children: {
      classesNames: string[];
      displayName: string;
      externalId?: string;
      id: string;
    }[];
  }[];
  parents?: {
    displayName: string;
    externalId?: string;
    id: string;
  }[];
  structureNodes?: StructureNode[];
  homePhone?: string;
  mobile?: string;
  email?: string;
}

export type UserPersonDataStructureWithClasses = Pick<StructureNode, 'UAI' | 'id' | 'name'> & {
  classes?: string[];
  exports?: null;
};

export interface UserPersonDataBackend {
  photo?: string;
  schools?: UserPersonDataStructureWithClasses[];
}

export namespace API {
  export interface AuthForgotResponse {
    ok: boolean;
    structures?: any[];
    error?: string;
  }
}

export function formatStructuresWithClasses(
  structureNodes?: StructureNode[],
  structuresWithClasses?: UserPersonDataStructureWithClasses[],
) {
  return structureNodes?.map(structure => ({
    ...structure,
    classes: structuresWithClasses?.find(sc => sc.id === structure.id)?.classes ?? [],
  }));
}

export async function createSession(platform: Platform, credentials: AuthCredentials | AuthFederationCredentials) {
  if (!platform) {
    throw new Error.LoginError(Error.LoginErrorType.NO_SPECIFIED_PLATFORM);
  }
  initOAuth2(platform);
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw new Error.LoginError(OAuth2ErrorCode.OAUTH2_INVALID_CLIENT);
  }

  if (credentialsAreLoginPassword(credentials)) {
    await OAuth2RessourceOwnerPasswordClient.connection.getNewTokenWithUserAndPassword(
      credentials.username,
      credentials.password,
      false, // Do not save token until login is completely successful
    );
  } else if (credentialsAreSaml(credentials)) {
    await OAuth2RessourceOwnerPasswordClient.connection.getNewTokenWithSAML(
      credentials.saml,
      false, // Do not save token until login is completely successful
    );
  } else if (credentialsAreCustomToken(credentials)) {
    await OAuth2RessourceOwnerPasswordClient.connection.getNewTokenWithCustomToken(
      credentials.customToken,
      false, // Do not save token until login is completely successful
    );
  } else {
    throw new global.Error(`[auth.createSession] given credentials are not recognisable.`);
  }
}

export async function restoreSession(platform: Platform, token: AuthTokenSet) {
  initOAuth2(platform);
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw new Error.LoginError(OAuth2ErrorCode.OAUTH2_INVALID_CLIENT);
  }
  OAuth2RessourceOwnerPasswordClient.connection.importToken(token);
  if (!OAuth2RessourceOwnerPasswordClient.connection.hasToken) {
    throw new Error.LoginError(Error.FetchErrorType.NOT_AUTHENTICATED, 'Failed to restore saved session');
  }
}

/**
 * @deprecated
 * Remove the old storage data of saved token
 */
export async function forgetPreviousSession() {
  try {
    if (!OAuth2RessourceOwnerPasswordClient.connection) {
      throw new Error.LoginError(OAuth2ErrorCode.OAUTH2_INVALID_CLIENT);
    }
    await OAuth2RessourceOwnerPasswordClient.connection.forgetToken();
  } catch (err) {
    throw new global.Error('Failed to forget previous (LEGACY) token', { cause: err });
  }
}

export function formatSession(
  addTimestamp: number,
  platform: Platform,
  loginUsed: string | undefined,
  userinfo: IUserInfoBackend,
  method?: InitialAuthenticationMethod,
  userPrivateData?: UserPrivateData,
  userPublicInfo?: UserPersonDataBackend,
  rememberMe?: boolean,
): AuthActiveAccount {
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw new Error.LoginError(OAuth2ErrorCode.OAUTH2_INVALID_CLIENT);
  }
  if (
    !userinfo.apps ||
    !userinfo.widgets ||
    !userinfo.authorizedActions ||
    !userinfo.userId ||
    !userinfo.login ||
    !userinfo.type ||
    !userinfo.username ||
    !userinfo.groupsIds ||
    !userinfo.firstName ||
    !userinfo.lastName
  ) {
    throw new Error.LoginError(Error.FetchErrorType.BAD_RESPONSE, 'Missing data in user info');
  }
  const user: Partial<AuthActiveUserInfo> = {
    avatar: userPublicInfo?.photo,
    birthDate: userinfo.birthDate ? moment(userinfo.birthDate) : undefined,
    classes: userinfo.classes,
    displayName: userinfo.username,
    email: userPrivateData?.email,
    firstName: userinfo.firstName,
    groups: userinfo.groupsIds,
    homePhone: userPrivateData?.homePhone,
    id: userinfo.userId,
    lastName: userinfo.lastName,
    login: userinfo.login,
    loginUsed,
    mobile: userPrivateData?.mobile,
    structures: formatStructuresWithClasses(userPrivateData?.structureNodes, userPublicInfo?.schools),
    type: userinfo.type,
    uniqueId: userinfo.uniqueId,
    // ... Add here every user-related (not account-related!) information that must be kept into the session. Keep it minimal.
  };
  // compute here detailed data about children (laborious)
  if (userPrivateData?.childrenStructure) {
    const children: {
      structureName: string;
      children: (Partial<UserChild> & Pick<UserChild, 'id'>)[];
    }[] = userPrivateData.childrenStructure;
    for (const structure of children) {
      if (!structure) continue;
      for (const child of structure.children) {
        const foundChild = userinfo.children?.[child.id];
        if (!foundChild) {
          throw new Error.LoginError(Error.FetchErrorType.BAD_RESPONSE, 'Missing data in user children');
        }
        child.lastName = foundChild.lastName;
        child.firstName = foundChild.firstName;
      }
    }
    (user as AuthActiveUserInfoRelative).children = children as UserChildren;
  }
  if (userPrivateData?.parents) {
    (user as AuthActiveUserInfoStudent).relatives = userPrivateData.parents;
  }
  return {
    addTimestamp,
    method,
    persist: rememberMe ? SessionPersistence.PERMANENT : SessionPersistence.TEMPORARY,
    platform,
    rights: {
      apps: userinfo.apps,
      authorizedActions: userinfo.authorizedActions,
      widgets: userinfo.widgets,
    },
    tokens: OAuth2RessourceOwnerPasswordClient.connection.exportToken(),
    user: user as AuthActiveUserInfo,
  } as AuthActiveAccountWithCredentials | AuthActiveAccountWithSaml;
}

/**
 * Old storage key used before 1.12 for selected platform
 * @deprecated
 */
export const PLATFORM_STORAGE_KEY = 'currentPlatform';

/**
 * Read the platform stored in MMKV.
 */
export async function loadCurrentPlatform() {
  const platformId = Storage.global.getString(PLATFORM_STORAGE_KEY);
  if (platformId) {
    const platform = appConf.getPlatformByName(platformId);
    if (!platform)
      throw new Error.LoginError(Error.LoginErrorType.INVALID_PLATFORM, `Loaded platform "${platformId}" doesn't exists.`);
    else return platform;
  } else {
    return undefined;
  }
}

/**
 * Read and select the platform stored in MMKV.
 * @deprecated
 */
export function savePlatform(platform: Platform) {
  Storage.global.set(PLATFORM_STORAGE_KEY, platform.name);
}

/**
 * @deprecated
 */
export function forgetPlatform() {
  Storage.global.delete(PLATFORM_STORAGE_KEY);
}

export async function ensureCredentialsMatchActivationCode(platform: Platform, credentials: AuthCredentials) {
  if (!platform) {
    throw new Error.LoginError(Error.LoginErrorType.NO_SPECIFIED_PLATFORM);
  }
  try {
    const res = await fetch(`${platform.url}/auth/activation/match`, {
      body: JSON.stringify({
        login: credentials.username,
        password: credentials.password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Device-Id': uniqueId(),
      },
      method: 'post',
    });
    if (!res.ok) {
      throw new Error.LoginError(Error.FetchErrorType.NOT_OK, 'Activation match response not OK');
    }
    const body = await res.json();
    if (!body.match) {
      throw new Error.LoginError(OAuth2ErrorCode.CREDENTIALS_MISMATCH);
    }
    return AuthPendingRedirection.ACTIVATE;
  } catch (activationErr) {
    throw new global.Error('Activation match error', { cause: activationErr });
  }
}

export async function ensureCredentialsMatchPwdRenewCode(platform: Platform, credentials: AuthCredentials) {
  if (!platform) {
    throw new Error.LoginError(Error.LoginErrorType.NO_SPECIFIED_PLATFORM);
  }
  try {
    const res = await fetch(`${platform.url}/auth/reset/match`, {
      body: JSON.stringify({
        login: credentials.username,
        password: credentials.password,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Device-Id': uniqueId(),
      },
      method: 'post',
    });
    if (!res.ok) {
      throw new Error.LoginError(Error.FetchErrorType.NOT_OK, 'Renew match response not OK');
    }
    const body = await res.json();
    if (!body.match) {
      throw new Error.LoginError(OAuth2ErrorCode.CREDENTIALS_MISMATCH);
    }
    return AuthPendingRedirection.RENEW_PASSWORD;
  } catch (err) {
    throw new global.Error('Pwd renew match error', { cause: err });
  }
}

export async function getAuthContext(platform: Platform) {
  const res = await fetch(`${platform.url}/auth/context`, {
    headers: {
      'X-Device-Id': uniqueId(),
    },
  });
  if (!res.ok) {
    throw new Error.LoginError(Error.FetchErrorType.NOT_OK, 'Get Auth context response not OK');
  }
  const activationContext: PlatformAuthContext = await res.json();
  return activationContext;
}

export async function getAuthTranslationKeys(platform: Platform, language: I18n.SupportedLocales) {
  try {
    // Note: a simple fetch() is used here, to be able to call the API even without a token (for example, while activating an account)
    const res = await fetch(`${platform.url}/auth/i18n`, { headers: { 'Accept-Language': language, 'X-Device-Id': uniqueId() } });
    if (res.ok) {
      const authTranslationKeys = await res.json();
      const legalUrls: LegalUrls = {
        cgu: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-cgu'), platform),
        cookies: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-cookies'), platform),
        personalDataProtection: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-personaldataprotection'), platform),
      };
      if (authTranslationKeys) {
        legalUrls.userCharter = urlSigner.getAbsoluteUrl(
          authTranslationKeys['auth.charter'] || I18n.get('user-legalurl-usercharter'),
          platform,
        );
      }
      return legalUrls;
    } else throw new Error.FetchError(Error.FetchErrorType.NOT_OK, 'getAuthTranslationKeys response not OK');
  } catch (err) {
    if (err instanceof Error.ErrorWithType) throw err;
    else throw new global.Error('getAuthTranslationKeys error', { cause: err });
  }
}

export async function revalidateTerms(session: AuthLoggedAccount) {
  await signedFetch(session.platform.url + '/auth/cgu/revalidate', {
    method: 'PUT',
  });
}

export async function getMFAValidationInfos() {
  try {
    const MFAValidationInfos = (await fetchJSONWithCache('/auth/user/mfa/code')) as IEntcoreMFAValidationInfos;
    return MFAValidationInfos;
  } catch (e) {
    console.error('[UserService] getMFAValidationInfos: could not get MFA validation infos', e);
  }
}

export async function verifyMFACode(key: string) {
  try {
    const mfaValidationState = (await fetchJSONWithCache('/auth/user/mfa/code', {
      body: JSON.stringify({ key }),
      method: 'POST',
    })) as IEntcoreMFAValidationState;
    return mfaValidationState;
  } catch (e) {
    console.error('[UserService] verifyMFACode: could not verify mfa code', e);
  }
}

export async function getMobileValidationInfos(platformUrl: string) {
  try {
    const mobileValidationInfos = await fetchJSONWithCache('/directory/user/mobilestate', {}, true, platformUrl);
    return mobileValidationInfos;
  } catch (err) {
    if (err instanceof Error.ErrorWithType) throw err;
    else throw new global.Error('getMobileValidationInfos error', { cause: err });
  }
}

export async function requestMobileVerificationCode(platform: Platform, mobile: string) {
  await signedFetch(platform.url + '/directory/user/mobilestate', {
    body: JSON.stringify({ mobile }),
    method: 'PUT',
  });
}

export async function verifyMobileCode(key: string) {
  try {
    const mobileValidationState = (await fetchJSONWithCache('/directory/user/mobilestate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    })) as IEntcoreMobileValidationState;
    return mobileValidationState;
  } catch (e) {
    console.error('[UserService] verifyMobileCode: could not verify mobile code', e);
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('verifyMobileCode: could not verify mobile code', { cause: e });
  }
}

export async function getEmailValidationInfos(platformUrl: string) {
  try {
    const emailValidationInfos = (await fetchJSONWithCache(
      '/directory/user/mailstate',
      {},
      true,
      platformUrl,
    )) as IEntcoreEmailValidationInfos;
    return emailValidationInfos;
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch email validation infos', { cause: e });
  }
}

export async function requestEmailVerificationCode(platform: Platform, email: string) {
  await signedFetch(platform.url + '/directory/user/mailstate', {
    body: JSON.stringify({ email }),
    method: 'PUT',
  });
}

export async function verifyEmailCode(key: string) {
  try {
    const emailValidationState = (await fetchJSONWithCache('/directory/user/mailstate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    })) as IEntcoreEmailValidationState;
    return emailValidationState;
  } catch (e) {
    console.error('[UserService] verifyEmailCode: could not verify email code', e);
  }
}

export async function getUserRequirements(platform: Platform) {
  const resp = await signedFetch(`${platform.url}/auth/user/requirements`);
  return resp.status === 404 ? null : (resp.json() as IUserRequirements);
}

export async function fetchRawUserRequirements(platform: Platform) {
  try {
    const requirements = await getUserRequirements(platform);
    return requirements as IUserRequirements;
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch raw user requirements', { cause: e });
  }
}

/**
 * Get flags status for the current user.
 * These flags may lead to partial session scenarios
 * where the user needs to do some action before retrying to login.
 *
 * CAUTION : the 'forceChangePassword' flag received from the server corresponds to a field named 'changePw' in the database.
 *
 * @param userRequirements get userRequirements from `fetchUserRequirements()`
 * @returns the first flag encountered (until there is none).
 */
export function getRequirementScenario(userRequirements: IUserRequirements) {
  // Note : MUST_CHANGE_PASSWORD need to be first, otherwise the other cases will not work and will be http 302.
  if (userRequirements.forceChangePassword) return AuthRequirement.MUST_CHANGE_PASSWORD;
  if (userRequirements.needRevalidateTerms) return AuthRequirement.MUST_REVALIDATE_TERMS;
  // When the requirement for initial CGU validation for federated accounts, put it here :)
  if (userRequirements.needRevalidateMobile) return AuthRequirement.MUST_VERIFY_MOBILE;
  if (userRequirements.needRevalidateEmail) return AuthRequirement.MUST_VERIFY_EMAIL;
}

export async function fetchUserInfo(platform: Platform) {
  try {
    const userinfo = (await fetchJSONWithCache(
      '/auth/oauth2/userinfo',
      {
        headers: {
          Accept: 'application/json;version=2.0',
        },
      },
      true,
      platform.url,
    )) as any;

    // Legacy app names for eventual compatibility
    userinfo.appsNames = userinfo.apps.map((e: any) => e.name);
    if (userinfo.appsNames.includes('Cahier de texte')) userinfo.appsNames.push('Homeworks');
    if (userinfo.appsNames.includes('Espace documentaire')) userinfo.appsNames.push('Workspace');
    if (userinfo.appsNames.includes('Actualites')) userinfo.appsNames.push('News');
    return userinfo as IUserInfoBackend;
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch user info', { cause: e });
  }
}

/**
 * Ensures that the user has the right conditions to create a session. Fire an exception otherwise.
 * Note : in some cases (force change password, revalidate cgu, etc.), allows to create a session but not to use the app.
 *        These corner-cases are managed in dedicated functions.
 * @param userInfo get userInfo from `fetchUserInfo()`
 */
export function ensureUserValidity(userinfo: IUserInfoBackend) {
  if (userinfo.deletePending) {
    throw new AccountError(AccountErrorCode.ACCOUNT_INELIGIBLE_PRE_DELETED, 'User is predeleted');
  }
}

export async function fetchUserPublicInfo(userinfo: IUserInfoBackend, platform: Platform) {
  try {
    if (!userinfo.userId) {
      throw new global.Error('fetchUserPublicInfo : User id has not being returned by the server');
    }
    if (!userinfo.type) {
      throw new global.Error('fetchUserPublicInfo : User type has not being returned by the server');
    }

    const [userdata, userPublicInfo] = await Promise.all([
      fetchJSONWithCache(`/directory/user/${userinfo.userId}`, {}, true, platform.url) as any,
      fetchJSONWithCache('/userbook/api/person?id=' + userinfo.userId, {}, true, platform.url),
    ]);

    // We fetch children information only for relative users
    const childrenStructure: UserPrivateData['childrenStructure'] =
      userinfo.type === AccountType.Relative
        ? await (fetchJSONWithCache('/directory/user/' + userinfo.userId + '/children', {}, true, platform.url) as any)
        : undefined;
    if (childrenStructure) {
      userdata.childrenStructure = childrenStructure;
    }

    // We enforce undefined parents for non-student users becase backend populates this with null data
    if (userinfo.type !== AccountType.Student) {
      userdata.parents = undefined;
    }

    return { userdata, userPublicInfo: userPublicInfo.result?.[0] } as {
      userdata?: UserPrivateData;
      userPublicInfo?: UserPersonDataBackend;
    };
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch user public info', { cause: e });
  }
}

interface IActivationSubmitPayload extends ActivationPayload {
  callBack: string;
  theme: string;
}

export async function activateAccount(platform: Platform, model: ActivationPayload) {
  const theme = platform.webTheme;
  const phoneNumber = model.phone;
  const phonePrefix = model.phoneCountry;

  const getIsValidMobileNumberForRegion = (toVerify: string) => {
    try {
      // Returns whether number is valid for selected region and an actual mobile number
      let isValidNumberForRegion = isValidNumber(toVerify, phonePrefix);
      let isValidMobileNumber = isMobileNumber(toVerify, phonePrefix);
      // Don't throw an error if phone number is not required by platform
      if (toVerify === '') {
        isValidNumberForRegion = true;
        isValidMobileNumber = true;
        return true;
      } else return isValidNumberForRegion && isValidMobileNumber;
    } catch {
      // Returns false in case of format error (string is too short, isn't recognized as a phone number, etc.)
      return false;
    }
  };

  const phoneNumberCleaned = phoneNumber.replaceAll(/[-.]+/g, '');
  const isValidMobileNumberForRegion = getIsValidMobileNumberForRegion(phoneNumberCleaned);

  if (!isValidMobileNumberForRegion) throw new global.Error('Invalid mobile number submitted');

  const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, phonePrefix);
  const mobileNumberNotEmpty = mobileNumberFormatted && mobileNumberFormatted.length > 0;

  if (!mobileNumberFormatted && mobileNumberNotEmpty) throw new global.Error('Failed to format mobile number');

  const payload: IActivationSubmitPayload = {
    acceptCGU: true,
    activationCode: model.activationCode,
    callBack: '',
    confirmPassword: model.confirmPassword,
    login: model.login,
    mail: model.mail || '',
    password: model.password,
    phone: mobileNumberFormatted || '',
    theme,
  };

  const formdata = new FormData();
  for (const key in payload) {
    formdata.append(key, payload[key]);
  }
  const res = await fetch(`${platform.url}/auth/activation/no-login`, {
    body: formdata,
    headers: {
      Accept: 'application/json',
      'Accept-Language': I18n.getLanguage(),
      'Content-Type': 'multipart/form-data',
      'X-APP': 'mobile',
      'X-APP-NAME': DeviceInfo.getApplicationName(),
      'X-APP-VERSION': DeviceInfo.getReadableVersion(),
      'X-Device-Id': uniqueId(),
    },
    method: 'post',
  });
  if (!res.ok) {
    throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'));
  }
  if (res.headers.get('content-type')?.indexOf('application/json') !== -1) {
    const resBody = await res.json();
    if (resBody.error) {
      throw createActivationError('activation', resBody.error.message);
    }
  }
  await CookieManager.clearAll();
}

// ToDo : type def for response type
export async function forgot<Mode extends 'password'>(
  platform: Platform,
  mode: Mode,
  payload: { login: string },
  deviceId: string,
): Promise<API.AuthForgotResponse>;
export async function forgot<Mode extends 'id'>(
  platform: Platform,
  mode: Mode,
  payload: { mail: string } | { mail: string; firstName: string; structureId: string },
  deviceId: string,
): Promise<API.AuthForgotResponse>;
export async function forgot<Mode extends ForgotMode>(
  platform: Platform,
  mode: Mode,
  payload: { login: string } | { mail: string } | { mail: string; firstName: string; structureId: string },
  deviceId: string,
): Promise<API.AuthForgotResponse> {
  const realPayload = { ...payload, service: 'mail' };
  const api = mode === 'id' ? `${platform.url}/auth/forgot-id` : `${platform.url}/auth/forgot-password`;
  const res = await fetch(api, {
    body: JSON.stringify(realPayload),
    headers: {
      'Accept-Language': I18n.getLanguage(),
      'Content-Type': 'application/json',
      'X-APP': 'mobile',
      'X-APP-NAME': DeviceInfo.getApplicationName(),
      'X-APP-VERSION': DeviceInfo.getReadableVersion(),
      'X-Device-Id': uniqueId(),
    },
    method: 'POST',
  });
  const resStatus = res.status;
  const resJson = await res.json();
  const ok = resStatus >= 200 && resStatus < 300;
  const response = { ...resJson, ok };
  return response;
}
