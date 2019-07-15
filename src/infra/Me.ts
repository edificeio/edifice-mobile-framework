// TODO : THIS FILE IS FUCKED UP, IT HAS NO REASON TO BE HERE

import Conf from "../../ode-framework-conf";
import {
  fetchJSONWithCache,
  signedFetch,
  signedFetchJson
} from "./fetchWithCache";
import { getSessionInfo } from "../AppStore";

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

// LEGACY Code, before was in `auth` functional module
// ToDo : it directly alter the state !!!! NOT GOOD ! Fix this !
/*let dataFilled = false;
export const fillUserData = async () => {
  if (dataFilled) {
    return;
  }
  const data = await fetchJSONWithCache(`/directory/user/${getSessionInfo().userId}`);
  // tslint:disable-next-line:forin
  for (const prop in data) {
    getSessionInfo()[prop] = data[prop];
  }
  dataFilled = true;
};*/
