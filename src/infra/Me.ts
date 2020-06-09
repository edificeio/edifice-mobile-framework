// TODO : THIS FILE IS FUCKED UP, IT HAS NO REASON TO BE HERE

import Conf from "../../ode-framework-conf";
import {
  signedFetch,
  signedFetchJson
} from "./fetchWithCache";

const preferences = {} as any;

export const savePreference = async (appName: string, newData) => {
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  await signedFetch(
    `${Conf.currentPlatform.url}/userbook/preference/${appName}`,
    {
      body: JSON.stringify({ ...preferences[appName], ...newData }),
      method: "PUT"
    }
  );
};
export const preference = async (appName: string) => {
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const appPrefs = (await signedFetchJson(
    `${Conf.currentPlatform.url}/userbook/preference/${appName}`,
    {}
  )) as { preference: any };
  // console.log("returned pref:", appName, appPrefs);
  preferences[appName] = JSON.parse(appPrefs.preference);
  return JSON.parse(appPrefs.preference);
};
