import { AsyncStorage } from "react-native";
import Conf from "../Conf";
import { Connection } from "./Connection";

// DEPRECATED. Use fetchWithCache instead.

export const read = async (
  path,
  forceSync: boolean = true,
  platform: string = Conf.currentPlatform.url
) => {
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  if (!Connection.isOnline) {
    // tslint:disable-next-line:no-console
    console.warn(
      "OLD DEPRECATED 'read' function: User offline, reading from cache"
    );
  }
  const fromCache = await AsyncStorage.getItem(path);

  if (Connection.isOnline && !(!forceSync && fromCache)) {
    const response = await fetch(`${platform}${path}`);
    const data = await response.json();
    await AsyncStorage.setItem(path, JSON.stringify(data));
    return data;
  }

  if (fromCache) {
    return JSON.parse(fromCache);
  }
  return [];
};