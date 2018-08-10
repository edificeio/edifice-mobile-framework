import { AsyncStorage } from "react-native";
import { Conf } from "../Conf";
import { Connection } from "./Connection";

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
  const dataFromCache = await AsyncStorage.getItem(path);

  if (Connection.isOnline && (forceSync || !dataFromCache)) {
    console.log("fetch from web");
    const response = await fetch(`${platform}${path}`, init);
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
    console.log("fetch from cache");
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
