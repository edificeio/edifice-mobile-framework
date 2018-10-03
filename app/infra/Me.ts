// TODO : THIS FILE IS FUCKED UP, IT HAS NO REASON TO BE HERE

import { Conf } from "../Conf";
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

// LEGACY Code, before was in `auth` functional module
let dataFilled = false;
export const fillUserData = async () => {
  if (dataFilled) {
    return;
  }
  const data = await fetchJSONWithCache(`/directory/user/${Me.session.userId}`);
  // tslint:disable-next-line:forin
  for (let prop in data) {
    Me.session[prop] = data[prop];
  }
  dataFilled = true;
};
