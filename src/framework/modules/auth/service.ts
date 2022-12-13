import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import appConf, { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { UserType } from '~/framework/util/session';
import { Connection } from '~/infra/Connection';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';
import { OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient, initOAuth2 } from '~/infra/oauth';

import { IAuthContext, IAuthCredentials, ISession, PartialSessionScenario, RuntimeAuthErrorCode, createAuthError } from './model';

export interface IUserInfoBackend {
  // ToDo: type it !
  userId?: string;
  type?: UserType;
  deletePending?: boolean;
  hasApp?: boolean;
  forceChangePassword?: boolean;
  needRevalidateTerms?: boolean;
  apps?: IEntcoreApp[];
  widgets?: IEntcoreWidget[];
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
 * Ensure that user has condition to create a session. Fire an exception if not.
 * Note : in some cases (force change password, revalidate cgu, etc) allow to create a session but not to use the app.
 *        These corner-cases are managed in dedicated functions.
 * @param userinfo user info got from `fetchUserInfo` function.
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

/**
 * Get flags status for the current user.
 * These flags may leady to partial sessions scenarios
 * where the user needs to do some action before retry login.
 *
 * CAUTION : the 'forceChangePassword' flag received from the server corresponds to a field named 'changePw' in the database.
 *
 * @param userinfo got userInfo from `fetchUserInfo()`
 * @returns the first flag encountered. May returns a flag until there is no one more.
 */
export function getPartialSessionScenario(userinfo: IUserInfoBackend) {
  if (userinfo.forceChangePassword) return PartialSessionScenario.MUST_CHANGE_PASSWORD;
  if (userinfo.needRevalidateTerms) return PartialSessionScenario.MUST_REVALIDATE_TERMS;
}

export async function fetchUserPublicInfo(userinfo: IUserInfoBackend, platform: Platform) {
  try {
    if (!userinfo.userId) {
      throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', 'User id has not being returned by the server');
    }
    if (!userinfo.type) {
      throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', 'User type has not being returned by the server');
    }

    const userdata = (await fetchJSONWithCache(`/directory/user/${userinfo.userId}`, {}, true, platform.url)) as any;
    userdata.childrenStructure =
      userinfo.type === 'Relative'
        ? await (fetchJSONWithCache('/directory/user/' + userinfo.userId + '/children', {}, true, platform.url) as any)
        : undefined;

    const userPublicInfo = await fetchJSONWithCache('/userbook/api/person?id=' + userinfo.userId, {}, true, platform.url);
    return { userdata, userPublicInfo };
  } catch (err) {
    throw createAuthError(RuntimeAuthErrorCode.USERPUBLICINFO_FAIL, '', '', err as Error);
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

export function formatSession(platform: Platform, userinfo: IUserInfoBackend): ISession {
  if (!OAuth2RessourceOwnerPasswordClient.connection) {
    throw createAuthError(RuntimeAuthErrorCode.RUNTIME_ERROR, 'Failed to init oAuth2 client', '');
  }
  if (!userinfo.apps || !userinfo.widgets) {
    throw createAuthError(RuntimeAuthErrorCode.USERINFO_FAIL, 'Missing apps or widgets in user info', '');
  }
  return {
    platform,
    oauth2: OAuth2RessourceOwnerPasswordClient.connection,
    apps: userinfo.apps,
    widgets: userinfo.widgets,
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
  const res = await fetch(`${platform.url}/auth/context`);
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
    } catch (e) {
      // TODO: Manage error
    }
    return [];
  }

  private async _addTokenToDeleteQueue(token: string) {
    if (!token) {
      return;
    }
    //merge is not supported by all implementation
    const tokens = await this._getTokenToDeleteQueue();
    tokens.push(token);
    //keep uniq tokens
    const json = JSON.stringify(Array.from(new Set(tokens)));
    await AsyncStorage.setItem(FcmService.FCM_TOKEN_TODELETE_KEY, json);
  }

  private async _removeTokenFromDeleteQueue(token: string) {
    if (!token) {
      return;
    }
    //merge is not supported by all implementation
    let tokens = await this._getTokenToDeleteQueue();
    tokens = tokens.filter(t => t != token);
    const json = JSON.stringify(tokens);
    await AsyncStorage.setItem(FcmService.FCM_TOKEN_TODELETE_KEY, json);
  }

  async unregisterFCMToken(token: string | null = null) {
    try {
      if (!token) {
        token = await messaging().getToken();
      }
      const deleteTokenResponse = await signedFetch(`${this.platform.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`, {
        method: 'delete',
      });
      this._removeTokenFromDeleteQueue(token);
    } catch (err) {
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
      const putTokenResponse = await signedFetch(`${this.platform.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`, {
        method: 'put',
      });
      this.pendingRegistration = 'registered';
      //try to unregister queue
      this._cleanQueue(); //clean queue on login
      //
    } catch (err) {
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

export async function revalidateTerms(session: ISession) {
  try {
    await fetchJSONWithCache('/auth/cgu/revalidate', {
      method: 'PUT',
    });
  } catch (e) {
    // console.warn('[UserService] revalidateTerms: could not revalidate terms', e);
  }
}
