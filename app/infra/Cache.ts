import { AsyncStorage } from "react-native";
import { Conf } from "../Conf";
import { Connection } from "./Connection";

// DEPRECATED. Use fetchWithCache instead.

console.log(Conf.platform);

export const read = async (
  path,
  forceSync: boolean = true,
  platform: string = Conf.platform
) => {
  if (!Connection.isOnline) {
    console.log("User offline, reading from cache");
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

export const usersAvatars = async () => {
  const latestAvatars = await AsyncStorage.getItem("latestUsersAvatars");
  const d = new Date();
  if (Connection.isOnline && latestAvatars != d.getDate().toString()) {
    return {};
  }
  const avatars = await AsyncStorage.getItem("usersAvatars");
  if (!avatars) {
    return {};
  }
  return JSON.parse(avatars);
};

export const setUsersAvatars = async avatars => {
  const d = new Date();
  await AsyncStorage.setItem("latestUsersAvatars", d.getDate().toString());
  await AsyncStorage.setItem("usersAvatars", JSON.stringify(avatars));
};
