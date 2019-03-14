import {
  clearRequestsCache,
  fetchJSONWithCache,
  signedFetch
} from "../../infra/fetchWithCache";
import {
  OAuth2RessourceOwnerPasswordClient,
  OAuthError
} from "../../infra/oauth";
import { navigate } from "../../navigation/helpers/navHelper";
import userConfig from "../config";

// Legacy imports
import firebase from "react-native-firebase";
import Conf from "../../Conf";
import Tracking from "../../tracking/TrackingManager"; // TODO make tracking back !
import { userService } from "../service";
import { initActivationAccount } from "./activation";

// TYPES ------------------------------------------------------------------------------------------------

export enum LoginResult {
  success,
  passwordError,
  connectionError
}

// ACTION TYPES --------------------------------------------------------------------------------------

export const actionTypeRequestLogin = userConfig.createActionType(
  "REQUEST_LOGIN"
);
export const actionTypeLoggedIn = userConfig.createActionType("LOGGED_IN");
export const actionTypeLoginError = userConfig.createActionType("LOGIN_ERROR");
export const actionTypeLoggedOut = userConfig.createActionType("LOGGED_OUT");
export const actionTypeLoginCancel = userConfig.createActionType(
  "LOGIN_CANCEL"
);

// THUNKS -----------------------------------------------------------------------------------------

export function login(
  redirectOnError: boolean = false,
  credentials?: { username: string; password: string }
) {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      if (!OAuth2RessourceOwnerPasswordClient.connection)
        throw new Error("no active oauth connection");

      dispatch({ type: actionTypeRequestLogin });

      // === 1: Get oAuth token from somewhere (server or local storage)
      if (credentials) {
        await OAuth2RessourceOwnerPasswordClient.connection.getToken(
          credentials.username,
          credentials.password
        );
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await OAuth2RessourceOwnerPasswordClient.connection.loadToken();
      }

      // === 2: Gather logged user information
      const userinfo2 = await fetchJSONWithCache("/auth/oauth2/userinfo", {
        headers: {
          Accept: "application/json;version=2.0"
        }
      });
      // console.log("oauth2 userinfo", userinfo2);
      // console.log(userinfo2.apps);
      userinfo2.apps = userinfo2.apps.map(e => e.name);
      // console.log("apps: ", userinfo2.apps);
      const userdata = await fetchJSONWithCache(
        `/directory/user/${userinfo2.userId}`
      );

      // === 3: check user validity

      if (!userinfo2.hasApp) {
        const err = new Error("EAUTH: You are not a premium user.");
        (err as any).authErr = OAuthError.NOT_PREMIUM;
        throw err;
      }

      // === 4: Get firebase device token and store it in the backend
      const hasPermission = await firebase.messaging().hasPermission();
      if (hasPermission) {
        await userService.registerFCMToken();
      } else {
        try {
          // console.log("asking for perms...");
          await firebase.messaging().requestPermission();
          await userService.registerFCMToken();
        } catch (e) {
          // console.log("Hasnt got permission to register the device token");
        }
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
        platform: Conf.currentPlatform.url
      });

      // === 7: navigate back to the main screen
      navigate("Main");
    } catch (err) {
      if (err.authErr !== OAuthError.NO_TOKEN) {
        // Absence of token in the store is not considered as an error. It's a regular case.
        // tslint:disable-next-line:no-console
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
          platform: Conf.currentPlatform.url
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
          // === try to see whether the user has used his activationCode as password
          const res = await fetch(
            `${Conf.currentPlatform.url}/auth/activation/match`,
            {
              body: JSON.stringify({
                login: credentials.username,
                password: credentials.password
              }),
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              method: "post"
            }
          );
          // if server return 200 and match is true => password is activationcode
          if (res.ok) {
            const body = await res.json();
            if (body.match) {
              dispatch(
                initActivationAccount(
                  {
                    activationCode: credentials.password,
                    login: credentials.username
                  },
                  true
                )
              );
              return;
            }
          } else {
            console.warn(
              "[User][login] match fail with error code: ",
              res.status,
              res.statusText
            );
          }
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
      if (redirectOnError) navigate("Login");
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const login = getState().user.auth.login;

      // === 0: Tracking reporting, only on manual logout

      Tracking.logEvent("logout", {
        platform: Conf.currentPlatform.url
      });

      // === 1: Unregister the device token from the backend
      await userService.unregisterFCMToken();
      // console.log("Fcm Token (delete) :", token, deleteTokenResponse);
      // === 2: Erase stored oauth2 token and cache information
      await OAuth2RessourceOwnerPasswordClient.connection.eraseToken();
      await clearRequestsCache();

      // === 3: Validate log out
      dispatch({ type: actionTypeLoggedOut });

      // === 4: Nav back on the login screen
      navigate("Login");
    } catch (err) {
      navigate("Login");
    }
  };
}

export function refreshToken(newToken) {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const authState = getState().user.auth;
      if (!authState.loggingIn) return false;
      //
      await userService.unregisterFCMToken();
      //
      await userService.registerFCMToken(newToken);
      // console.log("Fcm Token (refresh put) :", newToken, putTokenResponse);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  };
}
