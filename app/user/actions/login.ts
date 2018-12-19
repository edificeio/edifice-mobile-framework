import {
  clearCache,
  fetchJSONWithCache,
  signedFetch
} from "../../infra/fetchWithCache";
import oauth, { OAuthError } from "../../infra/oauth";
import { navigate } from "../../navigation/helpers/navHelper";
import userConfig from "../config";

// Legacy imports
import firebase from "react-native-firebase";
import { Conf } from "../../Conf";
import Tracking from "../../tracking/TrackingManager"; // TODO make tracking back !

export const actionTypeRequestLogin = userConfig.createActionType(
  "REQUEST_LOGIN"
);
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

      // === 1: Get oAuth token from somewhere (server or local storage)
      if (credentials) {
        await oauth.getToken(credentials.username, credentials.password);
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await oauth.loadToken();
      }

      // === 2: Get firebase device token and store it in the backend
      const token = await firebase.messaging().getToken();
      // console.log(token);
      const putTokenResponse = await signedFetch(
        `${Conf.platform}/timeline/pushNotif/fcmToken?fcmToken=${token}`,
        {
          method: "put"
        }
      );
      // console.log("put token response: ", putTokenResponse);

      // === 3: Gather logged user information
      const userinfo2 = await fetchJSONWithCache("/auth/oauth2/userinfo", {
        headers: {
          Accept: "application/json;version=2.0"
        }
      });
      // console.log("oauth2 userinfo", userinfo2);
      userinfo2.apps = userinfo2.apps.map(e => e.displayName);
      // console.log("apps: ", userinfo2.apps);
      const userdata = await fetchJSONWithCache(
        `/directory/user/${userinfo2.userId}`
      );

      // === 4: check user validity

      if (!userinfo2.hasApp) {
        const err = new Error("EAUTH: You are not a premium user.");
        (err as any).authErr = OAuthError.NOT_PREMIUM;
        throw err;
      }

      // === 5: validate login
      dispatch({
        type: actionTypeLoggedIn,
        userbook: userinfo2,
        userdata
      });

      // === 6: Tracking reporting (only on success)

      Tracking.logEvent("login", {
        isManual: credentials ? "true" : "false",
        platform: Conf.platform
      });

      // === 7: navigate back to the main screen
      navigate("Main");
    } catch (err) {
      if (err.authErr !== OAuthError.NO_TOKEN) {
        // Absence of token in the store is not considered as an error. It's a regular case.
        console.warn(err);
        Tracking.logEvent("failedLogin", {
          cause:
            err.authErr === OAuthError.BAD_CREDENTIALS
              ? "bad credentials"
              : err.authErr === OAuthError.NOT_PREMIUM
              ? "not premium"
              : err.authErr === OAuthError.NETWORK_ERROR
              ? "network error"
              : "unkown",
          isManual: credentials ? "true" : "false",
          platform: Conf.platform
        });
      }
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

      // === 0: Tracking reporting, only on manual logout

      Tracking.logEvent("logout", {
        platform: Conf.platform
      });

      // === 1: Unregister the device token from the backend
      const token = await firebase.messaging().getToken();
      // console.log(token);
      const deleteTokenResponse = await signedFetch(
        `${Conf.platform}/timeline/pushNotif/fcmToken?fcmToken=${token}`,
        { method: "delete" }
      );
      // console.log("delete token response: ", deleteTokenResponse);
      // === 2: Erase stored oauth2 token and cache information
      await oauth.eraseToken();
      await clearCache();

      // === 3: Validate log out
      dispatch({ type: actionTypeLoggedOut });

      // === 4: Nav back on the login screen
      navigate("Login", { login });
    } catch (err) {
      navigate("Login", { login: "" });
    }
  };
}

export function refreshToken(newToken) {
  return async (dispatch, getState) => {
    try {
      const authState = getState().user.auth;
      if (!authState.loggingIn) return false;

      const oldToken = await firebase.messaging().getToken();
      const deleteTokenResponse = await signedFetch(
        `${Conf.platform}/timeline/pushNotif/fcmToken?fcmToken=${oldToken}`,
        { method: "delete" }
      );
      const putTokenResponse = await signedFetch(
        `${Conf.platform}/timeline/pushNotif/fcmToken?fcmToken=${newToken}`,
        {
          method: "put"
        }
      );
    } catch (e) {
      console.warn(e);
    }
  };
}
