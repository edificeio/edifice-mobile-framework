import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';

import { SupportedLocales } from '~/app/i18n';
import appConf, { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { Connection } from '~/infra/Connection';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';
import { OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient, initOAuth2, uniqueId } from '~/infra/oauth';

import {
  IAuthContext,
  IAuthCredentials,
  ILoggedUser,
  ISession,
  PartialSessionScenario,
  RuntimeAuthErrorCode,
  StructureNode,
  UserChild,
  UserChildren,
  createAuthError,
} from './model';

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
  state: 'outdated | pending | valid'; // Validation state
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

export enum UserType {
  Student = 'Student',
  Relative = 'Relative',
  Teacher = 'Teacher',
  Personnel = 'Personnel',
  Guest = 'Guest',
}

export interface IAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo add other types here
}

export enum UserTypeBackend {
  Student = 'Student',
  Relative = 'Relative',
  Teacher = 'Teacher',
  Personnel = 'Personnel',
  Guest = 'Guest',
}

export interface IUserInfoBackend {
  // ToDo: type it !
  userId?: string;
  username?: string;
  login?: string;
  type?: UserType;
  deletePending?: boolean;
  hasApp?: boolean;
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
}

export interface UserPrivateData {
  childrenStructure?: {
    structureName: string;
    children: {
      classNames: string[];
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

export function formatStructuresWithClasses(
  structureNodes?: StructureNode[],
  structuresWithClasses?: UserPersonDataStructureWithClasses[],
) {
  return structureNodes?.map(structure => ({
    ...structure,
    classes: structuresWithClasses?.find(sc => sc.id === structure.id)?.classes ?? [],
  }));
}

export async function createSession(platform: Platform, credentials: { username: string; password: string }) {
  if (!platform) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'No platform specified', '');
  }
  initOAuth2(platform);
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'Failed to init oAuth2 client', '');
  }

  await OAuth2RessourceOwnerPasswordClient.connection.getNewTokenWithUserAndPassword(
    credentials.username,
    credentials.password,
    false, // Do not save token until login is completely successful
  );
}

export function restoreSessionAvailable() {
  return OAuth2RessourceOwnerPasswordClient.getStoredTokenStr();
}

export async function restoreSession(platform: Platform, fromData?: string) {
  initOAuth2(platform);
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'Failed to init oAuth2 client', '');
  }
  await OAuth2RessourceOwnerPasswordClient.connection.loadToken(fromData);
  if (!OAuth2RessourceOwnerPasswordClient.connection.hasToken) {
    throw createAuthError(RuntimeAuthErrorCode.RESTORE_FAIL, 'Failed to restore saved session', '');
  }
}

export async function saveSession() {
  try {
    if (!OAuth2RessourceOwnerPasswordClient.connection) {
      throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'Failed to init oAuth2 client', '');
    }
    await OAuth2RessourceOwnerPasswordClient.connection.saveToken();
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, '', 'Failed to save token', err as Error);
  }
}

export function formatSession(
  platform: Platform,
  userinfo: IUserInfoBackend,
  userPrivateData?: UserPrivateData,
  userPublicInfo?: UserPersonDataBackend,
): ISession {
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'Failed to init oAuth2 client', '');
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
    throw createAuthError(RuntimeAuthErrorCode.USERINFO_FAIL, 'Missing data in user info', '');
  }
  const user: ILoggedUser = {
    id: userinfo.userId,
    login: userinfo.login,
    type: userinfo.type,
    displayName: userinfo.username,
    firstName: userinfo.firstName,
    lastName: userinfo.lastName,
    groups: userinfo.groupsIds,
    classes: userinfo.classes,
    structures: formatStructuresWithClasses(userPrivateData?.structureNodes, userPublicInfo?.schools),
    uniqueId: userinfo.uniqueId,
    photo: userPublicInfo?.photo,
    mobile: userPrivateData?.mobile,
    email: userPrivateData?.email,
    homePhone: userPrivateData?.homePhone,
    birthDate: userinfo.birthDate ? moment(userinfo.birthDate) : undefined,
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
          throw createAuthError(RuntimeAuthErrorCode.USERINFO_FAIL, 'Missing data in user children', '');
        }
        child.lastName = foundChild.lastName;
        child.firstName = foundChild.firstName;
      }
    }
    user.children = children as UserChildren;
  }
  if (userPrivateData?.parents) {
    user.relatives = userPrivateData.parents;
  }
  return {
    platform,
    oauth2: OAuth2RessourceOwnerPasswordClient.connection,
    apps: userinfo.apps,
    widgets: userinfo.widgets,
    authorizedActions: userinfo.authorizedActions,
    // ... Add here every account-related (not user-related!) information that must be kept into the session. Keep it minimal.
    user,
  };
}

export const PLATFORM_STORAGE_KEY = 'currentPlatform';

/**
 * Read the platform stored in AsyncStorage.
 */
export async function loadCurrentPlatform() {
  const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
  if (platformId) {
    const platform = appConf.platforms.find(_pf => _pf.name === platformId);
    if (!platform)
      throw createAuthError(RuntimeAuthErrorCode.PLATFORM_NOT_EXISTS, '', `Loaded platform "${platformId}" doesn't exists.`);
    else return platform;
  } else {
    return undefined;
  }
}

/**
 * Read and select the platform stored in AsyncStorage.
 */
export async function savePlatform(platform: Platform) {
  await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, platform.name);
}

export async function ensureCredentialsMatchActivationCode(platform: Platform, credentials: IAuthCredentials) {
  if (!platform) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'No platform specified', '');
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
      throw createAuthError(RuntimeAuthErrorCode.ACTIVATION_ERROR, '', 'Activation match HTTP code not 200');
    }
    const body = await res.json();
    if (!body.match) {
      throw createAuthError(OAuth2ErrorCode.BAD_CREDENTIALS, '', 'Activation credentials no match');
    }
  } catch (activationErr) {
    throw createAuthError(RuntimeAuthErrorCode.ACTIVATION_ERROR, '', 'Activation match error', activationErr as Error);
  }
}

export async function getAuthContext(platform: Platform) {
  const res = await fetch(`${platform.url}/auth/context`, {
    headers: {
      'X-Device-Id': uniqueId(),
    },
  });
  if (!res.ok) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, '', 'Auth context code not 200');
  }
  const activationContext: IAuthContext = await res.json();
  return activationContext;
}

export class FcmService {
  static FCM_TOKEN_TODELETE_KEY = 'users.fcmtokens.todelete';

  lastRegisteredToken?: string;

  pendingRegistration: 'initial' | 'delayed' | 'registered' = 'initial';

  platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
    Connection.onEachNetworkBack(async () => {
      if (this.pendingRegistration === 'delayed') {
        await this.registerFCMToken();
      }
      this._cleanQueue();
    });
  }

  private async _cleanQueue() {
    const tokens = await this._getTokenToDeleteQueue();
    tokens.forEach(token => {
      this.unregisterFCMToken(token);
    });
  }

  private async _getTokenToDeleteQueue(): Promise<string[]> {
    try {
      const tokensCached = await AsyncStorage.getItem(FcmService.FCM_TOKEN_TODELETE_KEY);
      if (!tokensCached) return [];
      const tokens: string[] = JSON.parse(tokensCached);
      if (tokens instanceof Array) {
        return tokens;
      } else {
        //console.debug("not an array?", tokens)
      }
    } catch {
      // TODO: Manage error
    }
    return [];
  }

  private async _removeTokenFromDeleteQueue(token: string) {
    if (!token) {
      return;
    }
    //merge is not supported by all implementation
    let tokens = await this._getTokenToDeleteQueue();
    tokens = tokens.filter(t => t !== token);
    const json = JSON.stringify(tokens);
    await AsyncStorage.setItem(FcmService.FCM_TOKEN_TODELETE_KEY, json);
  }

  async unregisterFCMToken(token: string | null = null) {
    try {
      if (!token) {
        token = await messaging().getToken();
      }
      await signedFetch(`${this.platform.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`, {
        method: 'delete',
      });
      this._removeTokenFromDeleteQueue(token);
    } catch {
      //unregistering fcm token should not crash the login process
      if (Connection.isOnline) {
        //console.debug(err);
      } else {
        //when no connection => get it from property
        const tokenToUnregister = token || this.lastRegisteredToken;
        if (tokenToUnregister) this._removeTokenFromDeleteQueue(tokenToUnregister);
      }
    }
  }

  async registerFCMToken(token: string | null = null) {
    try {
      this.pendingRegistration = 'initial';
      if (!token) {
        token = await messaging().getToken();
      }
      this.lastRegisteredToken = token;
      await signedFetch(`${this.platform.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`, {
        method: 'put',
      });
      this.pendingRegistration = 'registered';
      //try to unregister queue
      this._cleanQueue(); //clean queue on login
      //
    } catch {
      //registering fcm token should not crash the login process
      if (Connection.isOnline) {
        //console.debug(err);
      } else {
        this.pendingRegistration = 'delayed';
      }
    }
  }
}

export async function manageFirebaseToken(platform: Platform) {
  try {
    const fcm = new FcmService(platform);
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      await fcm.registerFCMToken();
    }
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.FIREBASE_ERROR, '', '', err as Error);
  }
}

export async function removeFirebaseToken(platform: Platform) {
  try {
    const fcm = new FcmService(platform);
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      await fcm.unregisterFCMToken();
    }
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.FIREBASE_ERROR, '', '', err as Error);
  }
}

export async function getAuthTranslationKeys(platform: Platform, language: SupportedLocales) {
  try {
    // Note: a simple fetch() is used here, to be able to call the API even without a token (for example, while activating an account)
    const res = await fetch(`${platform.url}/auth/i18n`, { headers: { 'Accept-Language': language, 'X-Device-Id': uniqueId() } });
    if (res.ok) {
      const authTranslationKeys = await res.json();
      return authTranslationKeys;
    } else throw new Error('http response not 2xx');
  } catch (e) {
    throw createAuthError(RuntimeAuthErrorCode.LOAD_I18N_ERROR, '', '', e as Error);
  }
}

export async function revalidateTerms(session: ISession) {
  await signedFetch(session.platform.url + '/auth/cgu/revalidate', {
    method: 'PUT',
  });
}

export async function getMFAValidationInfos() {
  try {
    const MFAValidationInfos = (await fetchJSONWithCache('/auth/user/mfa/code')) as IEntcoreMFAValidationInfos;
    return MFAValidationInfos;
  } catch {
    // console.warn('[UserService] getMFAValidationInfos: could not get MFA validation infos', e);
  }
}

export async function verifyMFACode(key: string) {
  try {
    const mfaValidationState = (await fetchJSONWithCache('/auth/user/mfa/code', {
      method: 'POST',
      body: JSON.stringify({ key }),
    })) as IEntcoreMFAValidationState;
    return mfaValidationState;
  } catch {
    // console.warn('[UserService] verifyMFACode: could not verify mfa code', e);
  }
}

export async function getMobileValidationInfos() {
  try {
    const mobileValidationInfos = (await fetchJSONWithCache('/directory/user/mobilestate')) as IEntcoreMobileValidationInfos;
    return mobileValidationInfos;
  } catch {
    // console.warn('[UserService] getMobileValidationInfos: could not get mobile validation infos', e);
  }
}

export async function sendMobileVerificationCode(platform: Platform, mobile: string) {
  await signedFetch(platform.url + '/directory/user/mobilestate', {
    method: 'PUT',
    body: JSON.stringify({ mobile }),
  });
}

export async function verifyMobileCode(key: string) {
  try {
    const mobileValidationState = (await fetchJSONWithCache('/directory/user/mobilestate', {
      method: 'POST',
      body: JSON.stringify({ key }),
    })) as IEntcoreMobileValidationState;
    return mobileValidationState;
  } catch {
    // console.warn('[UserService] verifyMobileCode: could not verify mobile code', e);
  }
}

export async function getEmailValidationInfos() {
  try {
    const emailValidationInfos = (await fetchJSONWithCache('/directory/user/mailstate')) as IEntcoreEmailValidationInfos;
    return emailValidationInfos;
  } catch {
    // console.warn('[UserService] getEmailValidationInfos: could not get email validation infos', e);
  }
}

export async function sendEmailVerificationCode(platform: Platform, email: string) {
  await signedFetch(platform.url + '/directory/user/mailstate', {
    method: 'PUT',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCode(key: string) {
  try {
    const emailValidationState = (await fetchJSONWithCache('/directory/user/mailstate', {
      method: 'POST',
      body: JSON.stringify({ key }),
    })) as IEntcoreEmailValidationState;
    return emailValidationState;
  } catch {
    // console.warn('[UserService] verifyEmailCode: could not verify email code', e);
  }
}

export async function getUserRequirements(platform: Platform) {
  const resp = await signedFetch(`${platform.url}/auth/user/requirements`);
  return resp.status === 404 ? null : (resp.json() as IUserRequirements);
}

export async function fetchUserRequirements(platform: Platform) {
  try {
    const requirements = await getUserRequirements(platform);
    return requirements as IUserRequirements;
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.USERREQUIREMENTS_FAIL, 'Failed to fetch user requirements', '', err as Error);
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
export function getPartialSessionScenario(userRequirements: IUserRequirements) {
  if (userRequirements.forceChangePassword) return PartialSessionScenario.MUST_CHANGE_PASSWORD;
  if (userRequirements.needRevalidateTerms) return PartialSessionScenario.MUST_REVALIDATE_TERMS;
  if (userRequirements.needRevalidateMobile) return PartialSessionScenario.MUST_VERIFY_MOBILE;
  if (userRequirements.needRevalidateEmail) return PartialSessionScenario.MUST_VERIFY_EMAIL;
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
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.USERINFO_FAIL, 'Failed to fetch user info', '', err as Error);
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
    throw createAuthError(RuntimeAuthErrorCode.PRE_DELETED, '', 'User is predeleted');
  } else if (!userinfo.hasApp) {
    throw createAuthError(RuntimeAuthErrorCode.NOT_PREMIUM, '', 'Structure is not premium');
  }
  // else if (userinfo.forceChangePassword) {
  //   const error = createAuthError(RuntimeAuthErrorCode.MUST_CHANGE_PASSWORD, '', 'User must change his password');
  //   (error as any).userinfo = userinfo;
  //   throw error;
  // } else if (userinfo.needRevalidateTerms) {
  //   throw createAuthError(RuntimeAuthErrorCode.MUST_REVALIDATE_TERMS, '', 'User must revalidate CGU');
  // }
}

export async function fetchUserPublicInfo(userinfo: IUserInfoBackend, platform: Platform) {
  try {
    if (!userinfo.userId) {
      throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', 'User id has not being returned by the server');
    }
    if (!userinfo.type) {
      throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', 'User type has not being returned by the server');
    }

    const [userdata, userPublicInfo] = await Promise.all([
      fetchJSONWithCache(`/directory/user/${userinfo.userId}`, {}, true, platform.url) as any,
      fetchJSONWithCache('/userbook/api/person?id=' + userinfo.userId, {}, true, platform.url),
    ]);

    // We fetch children information only for relative users
    const childrenStructure: UserPrivateData['childrenStructure'] =
      userinfo.type === UserType.Relative
        ? await (fetchJSONWithCache('/directory/user/' + userinfo.userId + '/children', {}, true, platform.url) as any)
        : undefined;
    if (childrenStructure) {
      userdata.childrenStructure = childrenStructure;
    }

    // We enforce undefined parents for non-student users becase backend populates this with null data
    if (userinfo.type !== UserType.Student) {
      userdata.parents = undefined;
    }

    return { userdata, userPublicInfo: userPublicInfo.result?.[0] } as {
      userdata?: UserPrivateData;
      userPublicInfo?: UserPersonDataBackend;
    };
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', '', err as Error);
  }
}
