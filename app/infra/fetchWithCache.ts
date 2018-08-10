import { AsyncStorage } from "react-native";
import { Conf } from "../Conf";
import { Connection } from "./Connection";

/**
 * Perform a fetch operation usign the standard fetch api, with cache management.
 * It will saves the result of the fetch in the cache storage, and get from it if internet connexion isn't available.
 * @param path uri to fetch, without plateform. Must be absolute (start with "/" representing the root of the plateform domain)
 * @param init options of the standard fetch api (@see https://developer.mozilla.org/fr/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Param%C3%A8tres)
 * @param forceSync If true, fetch on internet preferably. If false, fetch on the the only if there is no cache.
 * @param platform url to the plateform (ex: "https://recette.opendigitaleducation.com") Uses global plateform configuration as defaut value.
 */
export async function fetchWithCache(
  path: string,
  init: any = {},
  forceSync: boolean = true,
  platform: string = Conf.platform
) {
  const dataFromCache = await AsyncStorage.getItem(path);

  if (Connection.isOnline && (forceSync || !dataFromCache)) {
    console.log("fetch from web");
    const response = await fetch(`${platform}${path}`, init);
    await AsyncStorage.setItem(path, JSON.stringify(response));
    return response;
  }

  if (dataFromCache) {
    console.log("fetch from cache");
    const json = JSON.parse(dataFromCache);
    return new Response(json._bodyText, {
      headers: json.headers,
      status: json.status
    });
  }

  return null;
}
