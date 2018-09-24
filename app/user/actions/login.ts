import { AsyncStorage } from "react-native";

import oauth, { IOAuthToken } from "../../infra/oauth";
import { navigate } from "../../utils/navHelper";

export enum LoginResult {
  success,
  passwordError,
  connectionError
}

export function login(credentials?: { username: string; password: string }) {
  return async (dispatch, getState) => {
    try {
      if (credentials) {
        await getToken(credentials);
        await saveToken(oauth.token);
      } else {
        await loadToken();
      }
      dispatch({ type: "USER_LOGGED_IN" });
      navigate("Main");
    } catch (errmsg) {
      // dispatch(homeworkDiaryListFetchError(errmsg));
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}

/**
 * Force get a fresh new token with given credentials.
 * @param credentials
 */
export async function getToken(credentials: {
  username: string;
  password: string;
}) {
  try {
    await oauth.getToken(credentials.username, credentials.password);
    // tslint:disable-next-line:no-console
    console.log(oauth);
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("get tokens failed.", errmsg);
    throw errmsg;
  }
}

/**
 * Read stored token in local storage.
 */
export async function loadToken(): Promise<IOAuthToken> {
  try {
    // tslint:disable-next-line:no-console
    console.log("load saved token");
    const token = JSON.parse(await AsyncStorage.getItem("token"));
    if (!token) throw new Error("No token stored");
    // tslint:disable-next-line:no-console
    console.log(token);
    return token;
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("load token failed.");
    throw errmsg;
  }
}

/**
 * Saves given token information in local storage.
 */
export async function saveToken(token: IOAuthToken) {
  try {
    await AsyncStorage.setItem("token", JSON.stringify(token));
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.warn("saving token failed.");
    throw err;
  }
}

/**
 * Earse stored token information in local storage.
 */
export async function eraseToken() {
  try {
    await AsyncStorage.removeItem("token");
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.warn("erasing token failed.");
    throw err;
  }
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      oauth.unsetToken();
      await eraseToken();
      dispatch({ type: "USER_LOGGED_OUT" });
      navigate("Login"); // TODO : place the user e-mail here
    } catch (errmsg) {
      // dispatch(homeworkDiaryListFetchError(errmsg));
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}