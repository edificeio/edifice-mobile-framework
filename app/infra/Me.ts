// TODO : THIS FILE IS FUCKED UP, IT HAS NO REASON TO BE HERE

import Conf from "../Conf";
import { IUserAuthState, stateDefault } from "../user/reducers/auth";
import { IUserInfoState } from "../user/reducers/info";
import {
  fetchJSONWithCache,
  signedFetch,
  signedFetchJson
} from "./fetchWithCache";

export const Me: {
  session: IUserAuthState & IUserInfoState;
} = {
  session: {
    ...stateDefault
  }
};

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
let dataFilled = false;
export const fillUserData = async () => {
  if (dataFilled) {
    return;
  }
  const data = await fetchJSONWithCache(`/directory/user/${Me.session.userId}`);
  // tslint:disable-next-line:forin
  for (const prop in data) {
    Me.session[prop] = data[prop];
  }
  dataFilled = true;
};
