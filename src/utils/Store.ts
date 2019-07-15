import { AsyncStorage } from "react-native";
import Conf from "../../ode-framework-conf";

export async function setLogin(value) {
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  await AsyncStorage.setItem(
    Conf.currentPlatform.url.authLoginStore,
    JSON.stringify(value)
  );
}

export async function getLogin() {
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const authString = await AsyncStorage.getItem(
    Conf.currentPlatform.url.authLoginStore
  );

  if (authString === null) {
    return {
      login: "",
      password: ""
    };
  }
  return JSON.parse(authString);
}
