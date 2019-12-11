import {
  clearRequestsCache,
  fetchJSONWithCache,
} from "../../infra/fetchWithCache";
import {
  OAuth2RessourceOwnerPasswordClient,
  OAuthError
} from "../../infra/oauth";
import { navigate } from "../../navigation/helpers/navHelper";
import userConfig from "../config";

// Legacy imports
import { Platform } from "react-native";
import firebase from "react-native-firebase";
import Conf from "../../../ode-framework-conf";
import Tracking from "../../tracking/TrackingManager"; // TODO make tracking back !
import { userService } from "../service";
import { initActivationAccount } from "./activation";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { clearTimeline } from "../../timeline/actions/clearTimeline";

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

let checkingIOSPermissions = false;

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
          credentials.password,
          false
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
      }) as any;
      // console.log("oauth2 userinfo", userinfo2);
      // console.log(userinfo2.apps);
      userinfo2.appsInfo = userinfo2.apps;
      userinfo2.apps = userinfo2.apps.map(e => e.name);

      // Some applications haven't a precise name... ☹️
      if (userinfo2.apps.includes("Cahier de texte"))
        userinfo2.apps.push("Homeworks");
      if (userinfo2.apps.includes("Espace documentaire"))
        userinfo2.apps.push("Workspace");
      if (userinfo2.apps.includes("Actualites")) userinfo2.apps.push("News");

      // === 3: check user validity

      if (!userinfo2.hasApp) {
        const err = new Error("EAUTH: You are not a premium user.");
        (err as any).authErr = OAuthError.NOT_PREMIUM;
        throw err;
      }

      // console.log("apps: ", userinfo2.apps);
      const userdata = await fetchJSONWithCache(
        `/directory/user/${userinfo2.userId}`
      ) as any;
      // console.log("childrenStructure", await fetchJSONWithCache('/directory/user/' + userinfo2.userId + '/children'));
      userdata.childrenStructure = userinfo2.type === "Relative" ?
        await (fetchJSONWithCache('/directory/user/' + userinfo2.userId + '/children') as any) :
        undefined;
      // console.log("oauth2 userdata", userdata);

      const userPublicInfo = await fetchJSONWithCache("/userbook/api/person?id=" + userinfo2.userId);
      // console.log("oauth2 userPublicInfo", userPublicInfo);

      // === 4: Get firebase device token and store it in the backend
      if (
        !checkingIOSPermissions &&
        Platform.OS === "ios" &&
        PushNotificationIOS
      ) {
        checkingIOSPermissions = true;
        PushNotificationIOS.checkPermissions(async permissions => {
          if (!permissions.alert || !permissions.badge || !permissions.sound) {
            await PushNotificationIOS.requestPermissions();
          }
          checkingIOSPermissions = false;
        });
      }
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
        userdata,
        userPublicInfo: userPublicInfo.result[0]
      });
      OAuth2RessourceOwnerPasswordClient.connection.saveToken();

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
          // End user session since no app rights (once regained, will have to login again)
          dispatch(endSession());
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
      if (redirectOnError) navigate("LoginHome");
    }
  };
}

function endSession() {
  return async (dispatch, getState) => {
      // Unregister the device token from the backend
      await userService.unregisterFCMToken();
      // Erase stored oauth2 token and cache information
      await OAuth2RessourceOwnerPasswordClient.connection.eraseToken();
      // Validate log out
      dispatch({ type: actionTypeLoggedOut });
  }
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");

      // === 0: Tracking reporting, only on manual logout
      Tracking.logEvent("logout", {
        platform: Conf.currentPlatform.url
      });

      clearTimeline(dispatch)(); // ToDo: this is ugly. Timeline should be cleared when logout.

      // // === 1: End user session
      await dispatch(endSession())
      await clearRequestsCache();

      // === 2: Nav back on the login screen
      navigate("LoginHome");
    } catch (err) {
      navigate("LoginHome");
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
