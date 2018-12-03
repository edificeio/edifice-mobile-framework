import { clearCache, fetchJSONWithCache } from "../../infra/fetchWithCache";
import oauth, { OAuthError } from "../../infra/oauth";
import { navigate } from "../../navigation/helpers/navHelper";
import userConfig from "../config";

export const actionTypeRequestLogin = userConfig.createActionType("REQUEST_LOGIN");
export const actionTypeLoggedIn = userConfig.createActionType("LOGGED_IN");
export const actionTypeLoginError = userConfig.createActionType("LOGIN_ERROR");
export const actionTypeLoggedOut = userConfig.createActionType("LOGGED_OUT");

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
      const userinfo2 = await fetchJSONWithCache("/auth/oauth2/userinfo", {
        headers: {
          Accept: "application/json;version=2.0"
        }
      });
      console.log("oauth2 userinfo", userinfo2);
      if (!userinfo2.hasApp) {
        const err = new Error("EAUTH: You are not a premium user.");
        (err as any).authErr = OAuthError.NOT_PREMIUM;
        throw err;
      }

      /*
      // Old UserInfo is not required here.
      const userinfo = await fetchJSONWithCache("/userbook/api/person");
      console.log("classic userinfo", userinfo);
      */

      const userdata = await fetchJSONWithCache(
        `/directory/user/${userinfo2.userId}`
      );
      // console.log("userdata", userdata);

      // 3: validate login
      dispatch({
        type: actionTypeLoggedIn,
        userbook: userinfo2,
        userdata
      });
      navigate("Main");
    } catch (err) {
      console.warn(err);
      switch (err.authErr) {
        case OAuthError.NO_TOKEN:
          dispatch({
            errmsg: undefined,
            type: actionTypeLoginError
          });
          break;
        case OAuthError.BAD_CREDENTIALS:
          dispatch({
            errmsg: "auth-loginFailed",
            type: actionTypeLoginError
          });
          break;
        case OAuthError.NOT_PREMIUM:
          dispatch({
            errmsg: "auth-notPremium",
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
      if (redirectOnError) navigate("Login", { login: "" });
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      const login = getState().user.auth.login;
      await oauth.eraseToken();
      dispatch({ type: actionTypeLoggedOut });
      await clearCache();
      navigate("Login", { login }); // TODO : place the user login here
    } catch (err) {
      navigate("Login", { login: "" });
    }
  };
}
