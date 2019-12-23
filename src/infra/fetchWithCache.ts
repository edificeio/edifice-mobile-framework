import { AsyncStorage } from "react-native";

import Conf from "../../ode-framework-conf";
import { navigate } from "../navigation/helpers/navHelper";
import { Connection } from "./Connection";
import { OAuth2RessourceOwnerPasswordClient } from "./oauth";

// This log doesn't mean anything since Conf is dynamic
// tslint:disable-next-line:no-console
// console.log("Distant platform:", Conf.currentPlatform.url);

/**
 * Perform a fetch operation with a oAuth Token. Use it like fetch().
 * @param requestInfo url including platform
 * @param init request options
 */
export async function signedFetch(
  requestInfo: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  try {
    if (!OAuth2RessourceOwnerPasswordClient.connection)
      throw new Error("no active oauth connection");
    if (OAuth2RessourceOwnerPasswordClient.connection.getIsTokenExpired()) {
      // tslint:disable-next-line:no-console
      // console.log("Token expired. Refreshing...");
      try {
        await OAuth2RessourceOwnerPasswordClient.connection.refreshToken();
      } catch (err) {
        navigate("LoginHome");
      }
    }
    // tslint:disable-next-line:no-console
    // console.log("Token expires in ", oauth.expiresIn() / 1000, "seconds");
    const req = OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo, init);
    // console.log("signed fetch:", url, params);
    return fetch(req);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.warn("Failed fetch with token: ", err);
    throw err;
  }
}

/**
 * Perform a fetch operation with a oAuth Token. Use it like fetch().
 * Use it when the intended response is JSON to get directly the resulting object.
 * @param url url including platform
 * @param init request options
 */
export async function signedFetchJson(url: string, init: any): Promise<object> {
  try {
    const response = await signedFetch(url, init);
    // console.log(response);
    // TODO check if response is OK
    return response.json();
  } catch (err) {
    // tslint:disable-next-line:no-console
    // console.warn("failed fetch json with token: ", err);
    throw err;
  }
}

const CACHE_KEY_PREFIX = "request-";

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
  platform: string = (Conf.currentPlatform as any).url,
  getBody = (r: Response) => r.text(),
  getCacheResult = (cr: any) => new Response(...cr)
) {
  if (!platform) throw new Error("must specify a platform");
  // TODO bugfix : cache key must depends on userID and platformID.
  const cacheKey = CACHE_KEY_PREFIX + path;
  const dataFromCache = await AsyncStorage.getItem(cacheKey); // TODO : optimization  - get dataFrmCache only when needed.
  if (Connection.isOnline && (forceSync || !dataFromCache)) {
    const response =
      path.indexOf((Conf.currentPlatform as any).url) === -1
        ? await signedFetch(`${platform}${path}`, init)
        : await signedFetch(`${path}`, init);
    // console.log("fetchWithCache", path, response);
    // TODO: check if response is OK
    const cacheResponse = {
      body: await getBody(response.clone()),
      init: {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      }
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheResponse));
    const ret = await getBody(response);
    return ret;
  }

  if (dataFromCache) {
    const cacheResponse = JSON.parse(dataFromCache);
    return getCacheResult(cacheResponse);
  }

  return null;
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
  platform: string = (Conf.currentPlatform as any).url
) {
  return fetchWithCache(
    path,
    init,
    forceSync,
    platform,
    r => r.json(),
    cr => cr.body
  ) as Promise<any>;
}

/**
 * Erase from AsyncStorage all data that keeps requests cache.
 */
export async function clearRequestsCache() {
  const keys = (await AsyncStorage.getAllKeys()).filter(str =>
    str.startsWith(CACHE_KEY_PREFIX)
  );
  // console.log("keys to clear:", keys);
  await AsyncStorage.multiRemove(keys);
}
