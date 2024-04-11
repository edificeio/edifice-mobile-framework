import NetInfo from '@react-native-community/netinfo';
import CookieManager from '@react-native-cookies/cookies';
import { ThunkDispatch } from 'redux-thunk';

import { getStore } from '~/app/store';
import { invalidateSessionAction } from '~/framework/modules/auth/actions';
import { assertSession, actions as authActions, getSession } from '~/framework/modules/auth/reducer';
import { OldStorageFunctions } from '~/framework/util/storage';

import { CACHE_KEY_PREFIX } from './cache';
import { OAuth2RessourceOwnerPasswordClient } from './oauth';

/** singleton boolean to prevent logout multiple time when parallel fetchs fails */
let isFailing: boolean = false;

/**
 * Perform a fetch operation with a oAuth Token. Use it like fetch().
 * @param requestInfo url including platform
 * @param init request options
 */
export async function signedFetch(requestInfo: RequestInfo, init?: RequestInit): Promise<Response> {
  if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('no active oauth connection');
  if (OAuth2RessourceOwnerPasswordClient.connection.getIsTokenExpired()) {
    try {
      const session = assertSession();
      await OAuth2RessourceOwnerPasswordClient.connection.refreshToken(session.user.id, true);
    } catch (err) {
      if (isFailing) throw err;
      isFailing = true;
      // We consider assume here user user is logged out, but we don't really destroy his session => sessionInvalidate.
      try {
        await (getStore().dispatch as ThunkDispatch<any, any, any>)(invalidateSessionAction());
        getStore().dispatch(authActions.authError({ info: new Error('session connot be refreshed', { cause: err }) }));
      } catch (e) {
        // Cannot remove FCM token if we havn't platform. Just dispatch error in this case.
        getStore().dispatch(authActions.authError({ info: new Error('cannot invalidate session', { cause: err }) }));
      }
      isFailing = false;
      throw err;
    }
  }
  const req = OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo, init);
  CookieManager.clearAll();
  return fetch(req);
}

/**
 * Perform a fetch operation with a oAuth Token. Use it like fetch().
 * Use it when the intended response is JSON to get directly the resulting object.
 * @param url url including platform
 * @param init request options
 */
export async function signedFetchJson(url: string | Request, init?: RequestInit): Promise<unknown> {
  const response = await signedFetch(url, init);
  // TODO check if response is OK
  return response.json();
}

export async function signedFetchJson2(url: string | Request, init?: any): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error('Fetch : no active session');
  }
  return signedFetchJson(session.platform.url + url, init);
}

export async function signedFetch2(url: string | Request, init?: any): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error('Fetch : no active session');
  }
  return signedFetch(session.platform.url + url, init);
}

export const getCachedData = async <T>(path: string) => {
  let cachedData: undefined;
  try {
    cachedData = await OldStorageFunctions.getItemJson(CACHE_KEY_PREFIX + path);
  } catch {
    // Do nothing. We don't want to fail.
  }
  return cachedData as T | undefined;
};

export const setCachedData = async (path: string, data: T) => {
  try {
    await OldStorageFunctions.setItemJson(CACHE_KEY_PREFIX + path, data);
  } catch {
    // Do nothing. We don't want to fail.
  }
};

/**
 * Perform a fetch operation usign the standard fetch api, with cache management.
 * It will saves the result of the fetch in the cache storage, and get from it if internet connexion isn't available.
 * /!\ Do not use this to fetch JSON data. Use fetchJSONWithCache instead.
 * @param path uri to fetch, without plateform. Must be absolute (start with "/" representing the root of the plateform domain)
 * @param init options of the standard fetch api (@see https://developer.mozilla.org/fr/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Param%C3%A8tres)
 * @param forceSync If true, fetch on internet preferably. If false, fetch on the the only if there is no cache.
 * @param platform url to the plateform (ex: "https://recette.opendigitaleducation.com") Uses global plateform configuration as defaut value.
 * @param getBody function that return a promise to get the body of the response. The default behaviour treat data as raw text.
 * @param getCacheResult funcation that return the cache result from the cache stored data. The default behaviour treat cache data as a Response.
 * @returns a Response object. Use it as you wish.
 */
export async function fetchWithCache(
  path: string,
  init: any = {},
  forceSync: boolean = true,
  platform: string | undefined = assertSession().platform.url,
  getBody: (r: Response) => any = r => r.text(),
  getCacheResult = (cr: any) => new Response(...cr),
) {
  const isConnected = await NetInfo.fetch().then(state => state.isConnected);
  // Continue if connected and if sync wanted
  if (isConnected && forceSync) {
    // Check platform
    if (!platform) throw new Error('must specify a platform');
    // Fetch
    const response =
      path.indexOf(platform) === -1 ? await signedFetch(`${platform}${path}`, init) : await signedFetch(`${path}`, init);
    // Manage response
    const data = {
      body: await getBody(response.clone()),
      init: {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      },
    };
    // Cache response data
    await setCachedData(path, data);
    // Return fetched data
    const ret = await getBody(response);
    return ret;
  }
  // Otherwise return cached data if any
  const cachedData = getCachedData(path);
  return cachedData ? getCacheResult(cachedData) : null;
}

/**
 * Perform a fetch operation that will recieve JSON object.
 * It will saves the result of the fetch in the cache storage, and get from it if internet connexion isn't available.
 * @param path uri to fetch, without plateform. Must be absolute (start with "/" representing the root of the plateform domain)
 * @param init options of the standard fetch api (@see https://developer.mozilla.org/fr/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Param%C3%A8tres)
 * @param forceSync If true, fetch on internet preferably. If false, fetch on the the only if there is no cache.
 * @param platform url to the plateform (ex: "https://recette.opendigitaleducation.com") Uses global plateform configuration as defaut value.
 * @returns the Js reprentation of the JSON data. Use it directly.
 */
export async function fetchJSONWithCache(
  path: string,
  init: any = {},
  forceSync: boolean = true,
  platform: string | undefined = assertSession().platform.url,
) {
  return fetchWithCache(
    path,
    init,
    forceSync,
    platform,
    r => r.json(),
    cr => cr.body,
  ) as Promise<any>;
}
