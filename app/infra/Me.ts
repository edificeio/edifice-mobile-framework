// TODO : THIS FILE IS FUCKED UP, IT HAS NO REASON TO BE HERE

import { Conf } from "../Conf";
import { IUserAuthState } from "../user/reducers/auth";
import { IUserInfoState } from "../user/reducers/info";
import { signedFetch, signedFetchJson } from "./fetchWithCache";

export const Me: {
  session: IUserAuthState & IUserInfoState;
} = {
  session: {
    loggedIn: false,
    loggingIn: false,
    synced: false
  }
};

const preferences = {} as any;

export const savePreference = async (appName: string, newData) => {
  await signedFetch(`${Conf.platform}/userbook/preference/${appName}`, {
    body: JSON.stringify({ ...preferences[appName], ...newData }),
    method: "PUT"
  });
};
export const preference = async (appName: string) => {
  const appPrefs = (await signedFetchJson(
    `${Conf.platform}/userbook/preference/${appName}`,
    {}
  )) as { preference: any };
  preferences[appName] = JSON.parse(appPrefs.preference);
  return JSON.parse(appPrefs.preference);
};
