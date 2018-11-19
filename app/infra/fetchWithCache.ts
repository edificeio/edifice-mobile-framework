import { AsyncStorage } from "react-native";

import { Conf } from "../Conf";
import { navigate } from "../navigation/helpers/navHelper";
import { Connection } from "./Connection";
import { Me } from "./Me";
import oauth from "./oauth";

// tslint:disable-next-line:no-console
console.log("Distant platform:", Conf.platform);

/**
 * Perform a fetch operation with a oAuth Token. Use it like fetch().
 * @param url url including platform
 * @param init request options
 */
export async function signedFetch(
  url: string,
  init: any = {}
): Promise<Response> {
  try {
    if (oauth.isExpired()) {
      // tslint:disable-next-line:no-console
      // console.log("Token expired. Refreshing...");
      try {
        await oauth.refreshToken();
      } catch (err) {
        navigate("Login", { login: Me.session.login });
      }
    }
    // tslint:disable-next-line:no-console
    // console.log("Token expires in ", oauth.expiresIn() / 1000, "seconds");

    const params = oauth.sign(init);
    return fetch(url, params);
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
  platform: string = Conf.platform,
  getBody = r => r.text(),
  getCacheResult = cr => new Response(...cr)
) {
  const dataFromCache = await AsyncStorage.getItem(path); // TODO : optimization  - get dataFrmCache only when needed.
  if (Connection.isOnline && (forceSync || !dataFromCache)) {
    const response = await signedFetch(`${platform}${path}`, init);
    // TODO: check if response is OK
    const cacheResponse = {
      body: await getBody(response.clone()),
      init: {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      }
    };
    await AsyncStorage.setItem(path, JSON.stringify(cacheResponse));
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
  platform: string = Conf.platform
) {
  return fetchWithCache(
    path,
    init,
    forceSync,
    platform,
    r => r.json(),
    cr => cr.body
  );
}

export async function clearCache() {
  await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
}
