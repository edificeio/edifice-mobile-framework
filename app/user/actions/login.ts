import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import oauth, { OAuthError } from "../../infra/oauth";
import { navigate } from "../../utils/navHelper";
import userConfig from "../config";

export const actionTypeRequestLogin = userConfig.createActionType("REQUEST_LOGIN");
export const actionTypeLogin = userConfig.createActionType("LOGGED_IN");
export const actionTypeLogout = userConfig.createActionType("LOGGED_OUT");
export const actionTypeLoginError = userConfig.createActionType("LOGIN_ERROR");

export enum LoginResult {
  success,
  passwordError,
  connectionError
}

export function login(
  redirectOnError: boolean = false,
  credentials?: { username: string; password: string }
) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: actionTypeRequestLogin });
      // 1: Get oAuth token from somewhere (server or local storage)
      if (credentials) {
        await oauth.getToken(credentials.username, credentials.password);
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await oauth.loadToken();
      }
      // 2: Gather logged user information
      console.log("gather user info...");
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
      navigate("Main");
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("login failed.", err.authErr, err);
      switch (err.authErr) {
        case OAuthError.NO_TOKEN:
          break;
        case OAuthError.BAD_CREDENTIALS:
          dispatch({
            errmsg: "auth-loginFailed",
            type: actionTypeLoginError
          });
          break;
        case OAuthError.NETWORK_ERROR:
          dispatch({
            errmsg: "auth-networkError",
            type: actionTypeLoginError
          });
          break;
        default:
          dispatch({
            errmsg: "auth-unknownError",
            type: actionTypeLoginError
          });
      }
      if (redirectOnError) navigate("Login", { email: "" });
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      await oauth.eraseToken();
      dispatch({ type: actionTypeLogout });
      navigate("Login"); // TODO : place the user login here
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("logout failed.");
      navigate("Login", { email: "" });
    }
  };
}
