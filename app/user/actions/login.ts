import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import oauth from "../../infra/oauth";
import { navigate } from "../../utils/navHelper";
import userConfig from "../config";

export const actionTypeLogin = userConfig.createActionType("LOGGED_IN");

export enum LoginResult {
  success,
  passwordError,
  connectionError
}

export function login(credentials?: { username: string; password: string }) {
  return async (dispatch, getState) => {
    try {
      // 1: Get oAuth token from somewhere (server or local storage)
      if (credentials) {
        await oauth.getToken(credentials.username, credentials.password);
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await oauth.loadToken();
      }

      // 2: Gather logged user information
      const userinfo = await fetchJSONWithCache("/userbook/api/person");
      // tslint:disable-next-line:no-console
      console.log("userinfo", userinfo);
      const userdata = await fetchJSONWithCache(
        `/directory/user/${userinfo.result["0"].userId}`
      );
      console.log("userdata", userdata);

      // 3: validate login
      dispatch({
        type: actionTypeLogin,
        userbook: userinfo.result["0"],
        userdata
      });
      console.log("dispatché");
      navigate("Main");
      console.log(getState());
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("login failed.", err);
      navigate("Login", { email: "" });
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      await oauth.eraseToken();
      dispatch({ type: "USER_LOGGED_OUT" });
      navigate("Login"); // TODO : place the user e-mail here
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}
