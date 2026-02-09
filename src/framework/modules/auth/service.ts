import CookieManager from '@react-native-cookies/cookies';
import moment from 'moment';
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
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedLoggedInAccount,
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
import { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { expirableTokenFactory, getOAuth2AccessToken, OAuth2ErrorCode } from '~/framework/util/oauth2';
import { platformFetch, tokenFetch } from '~/framework/util/transport';
import { FetchError, FetchErrorCode } from '~/framework/util/transport/error';

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
  functions?: { [key: string]: boolean };
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

export async function getToken(platform: Platform, credentials: AuthCredentials | AuthFederationCredentials) {
  if (credentialsAreLoginPassword(credentials)) {
    return getOAuth2AccessToken.withLoginPassword(platform, credentials);
  } else if (credentialsAreSaml(credentials)) {
    return getOAuth2AccessToken.withSaml2(platform, credentials.saml);
  } else if (credentialsAreCustomToken(credentials)) {
    return getOAuth2AccessToken.withCustomToken(platform, credentials.customToken);
  } else {
    throw new global.Error(`[auth.createSession] given credentials are not recognisable.`);
  }
}

export async function getOneSessionId({
  tokens,
}: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>): Promise<
  NonNullable<AuthActiveAccount['tokens']['oneSessionId']>
> {
  const response = await tokenFetch(tokens, '/auth/oauth2/token-as-cookie', { method: 'POST' });
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'getOneSessionId: no set-cookie header recieved');
  const match = cookie!.match(/oneSessionId=([^;]+)/);
  if (!match || !match[1])
    throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'getOneSessionId: set-cookie header does not include oneSessionId');
  return { value: match[1] };
}

export async function getQueryParamToken({
  tokens,
}: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>): Promise<NonNullable<AuthActiveAccount['tokens']['queryParam']>> {
  const response = await tokenFetch.json<{ token_type: 'QueryParam'; access_token: string; expires_in: number }>(
    tokens,
    '/auth/oauth2/token?type=queryparam',
  );
  return expirableTokenFactory(response);
}

export function formatSession(
  tokens: (AuthActiveAccount | AuthSavedLoggedInAccount)['tokens'],
  addTimestamp: number,
  logTimestamp: number,
  platform: Platform,
  loginUsed: string | undefined,
  userinfo: IUserInfoBackend,
  method?: InitialAuthenticationMethod,
  userPrivateData?: UserPrivateData,
  userPublicInfo?: UserPersonDataBackend,
  rememberMe?: boolean,
): AuthActiveAccount {
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
    throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'Missing data in user info');
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
    isAdml: userinfo.functions?.ADMIN_LOCAL ? true : false,
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
    logTimestamp,
    method,
    persist: rememberMe ? SessionPersistence.PERMANENT : SessionPersistence.TEMPORARY,
    platform,
    rights: {
      apps: userinfo.apps,
      authorizedActions: userinfo.authorizedActions,
      widgets: userinfo.widgets,
    },
    tokens,
    user: user as AuthActiveUserInfo,
  } as AuthActiveAccountWithCredentials | AuthActiveAccountWithSaml;
}

/**
 * Everything about checking that credentials matches one-time-passwords like activation codes or password renew code.
 */
export const otp = {
  _matchGeneric: async function (
    platform: Platform,
    credentials: AuthCredentials,
    api: string,
    returnValue: AuthPendingRedirection,
    message: string,
  ) {
    try {
      const response = await platformFetch.json<{ match?: unknown }>(platform, api, {
        body: JSON.stringify({
          login: credentials.username,
          password: credentials.password,
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!response.match) {
        throw new Error.LoginError(OAuth2ErrorCode.CREDENTIALS_MISMATCH);
      }
      return returnValue;
    } catch (e) {
      throw new global.Error(message, { cause: e });
    }
  },
  matchActivation: (platform: Platform, credentials: AuthCredentials) =>
    otp._matchGeneric(platform, credentials, `/auth/activation/match`, AuthPendingRedirection.ACTIVATE, 'Activation match error'),
  matchRenewCode: (platform: Platform, credentials: AuthCredentials) =>
    otp._matchGeneric(platform, credentials, `/auth/reset/match`, AuthPendingRedirection.RENEW_PASSWORD, 'Pwd renew match error'),
};

export const platformConfig = {
  authI18n: async (platform: Platform, language: I18n.SupportedLocales): Promise<LegalUrls> => {
    try {
      const authTranslationKeys = await platformFetch.json<{ 'auth.charter'?: string } | undefined>(platform, `/auth/i18n`, {
        headers: { 'Accept-Language': language },
      });
      return {
        cgu: new URL(platform.url, I18n.get('user-legalurl-cgu')).href,
        cookies: new URL(platform.url, I18n.get('user-legalurl-cookies')).href,
        personalDataProtection: new URL(platform.url, I18n.get('user-legalurl-personaldataprotection')).href,
        userCharter: new URL(platform.url, I18n.get(authTranslationKeys?.['auth.charter'] || I18n.get('user-legalurl-usercharter')))
          .href,
      };
    } catch (err) {
      if (err instanceof Error.ErrorWithType) throw err;
      else throw new global.Error('getAuthTranslationKeys error', { cause: err });
    }
  },
  context: (platform: Platform) => platformFetch.json<PlatformAuthContext>(platform, `/auth/context`),
};

export async function revalidateTerms({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) {
  await tokenFetch(tokens, '/auth/cgu/revalidate', {
    method: 'PUT',
  });
}

export const mfaValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IEntcoreMFAValidationInfos>(tokens, '/auth/user/mfa/code'),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<IEntcoreMFAValidationState>(tokens, '/auth/user/mfa/code', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const mobileValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IEntcoreMobileValidationInfos>(tokens, '/directory/user/mobilestate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, mobile: string) =>
    tokenFetch(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ mobile }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<IEntcoreMobileValidationState>(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const emailValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IEntcoreEmailValidationInfos>(tokens, '/directory/user/mailstate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, email: string) =>
    tokenFetch(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ email }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<IEntcoreEmailValidationState>(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const requirements = {
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
  getNextNeeded: (userRequirements: IUserRequirements) => {
    // Note : MUST_CHANGE_PASSWORD need to be first, otherwise the other cases will not work and will be http 302.
    if (userRequirements.forceChangePassword) return AuthRequirement.MUST_CHANGE_PASSWORD;
    if (userRequirements.needRevalidateTerms) return AuthRequirement.MUST_REVALIDATE_TERMS;
    // When the requirement for initial CGU validation for federated accounts, put it here :)
    if (userRequirements.needRevalidateMobile) return AuthRequirement.MUST_VERIFY_MOBILE;
    if (userRequirements.needRevalidateEmail) return AuthRequirement.MUST_VERIFY_EMAIL;
  },
  getState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IUserRequirements>(tokens, '/auth/user/requirements'),
};

export async function fetchUserInfo({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) {
  try {
    const userinfo = await tokenFetch.json<any>(tokens, '/auth/oauth2/userinfo', {
      headers: {
        Accept: 'application/json;version=2.0',
      },
    });

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
export function assertNotPredeleted(userinfo: IUserInfoBackend) {
  if (userinfo.deletePending) {
    throw new AccountError(AccountErrorCode.ACCOUNT_INELIGIBLE_PRE_DELETED, 'User is predeleted');
  }
}

export async function fetchUserPublicInfo(
  userinfo: IUserInfoBackend,
  { tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>,
) {
  try {
    if (!userinfo.userId) {
      throw new global.Error('fetchUserPublicInfo : User id has not being returned by the server');
    }
    if (!userinfo.type) {
      throw new global.Error('fetchUserPublicInfo : User type has not being returned by the server');
    }

    await tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}`);
    await tokenFetch.json<any>(tokens, `/userbook/api/person?id=${userinfo.userId}`);

    const [userdata, userPublicInfo] = await Promise.all([
      tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}`),
      tokenFetch.json<any>(tokens, `/userbook/api/person?id=${userinfo.userId}`),
    ]);

    // We fetch children information only for relative users
    const childrenStructure: UserPrivateData['childrenStructure'] =
      userinfo.type === AccountType.Relative
        ? await (tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}/children`) as any)
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

  const payload: Omit<IActivationSubmitPayload, 'mailState' | 'phoneCountry' | 'phoneState'> = {
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
  const res = await platformFetch(platform, `/auth/activation/no-login`, {
    body: formdata,
    headers: {
      'Accept': 'application/json',
      'Accept-Language': I18n.getLanguage(),
      'Content-Type': 'multipart/form-data',
    },
    method: 'POST',
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
): Promise<API.AuthForgotResponse>;
export async function forgot<Mode extends 'id'>(
  platform: Platform,
  mode: Mode,
  payload: { mail: string } | { mail: string; firstName: string; structureId: string },
): Promise<API.AuthForgotResponse>;
export async function forgot<Mode extends ForgotMode>(
  platform: Platform,
  mode: Mode,
  payload: { login: string } | { mail: string } | { mail: string; firstName: string; structureId: string },
): Promise<API.AuthForgotResponse> {
  const realPayload = { ...payload, service: 'mail' };
  const api = mode === 'id' ? `/auth/forgot-id` : `/auth/forgot-password`;
  const res = await platformFetch(platform, api, {
    body: JSON.stringify(realPayload),
    headers: {
      'Accept-Language': I18n.getLanguage(),
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const resStatus = res.status;
  const resJson = await res.json();
  const ok = resStatus >= 200 && resStatus < 300;
  const response = { ...resJson, ok };
  return response;
}
