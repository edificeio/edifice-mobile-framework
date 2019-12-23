import {
  clearRequestsCache,
  fetchJSONWithCache,
} from "../../infra/fetchWithCache";
import {
  OAuth2RessourceOwnerPasswordClient,
  OAuthError,
  OAuthErrorType
} from "../../infra/oauth";
import { navigate } from "../../navigation/helpers/navHelper";
import userConfig from "../config";

// Legacy imports
import { Platform } from "react-native";
import firebase from "react-native-firebase";
import Conf from "../../../ode-framework-conf";
import Tracking from "../../tracking/TrackingManager"; // TODO make tracking back !
import { userService } from "../service";
import { initActivationAccount as initActivationAccountAction } from "./activation";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { clearTimeline } from "../../timeline/actions/clearTimeline";
import { createEndSessionAction } from "../../infra/redux/reducerFactory";
import { ThunkDispatch } from "redux-thunk";

// TYPES ------------------------------------------------------------------------------------------------

enum LoginFlowErrorType {
  RUNTIME_ERROR = 'runtime_error',
  FIREBASE_ERROR = 'firebase_error',
  NOT_PREMIUM = 'not_premium'
}
export type LoginErrorType = OAuthErrorType | LoginFlowErrorType;

export enum LoginStatus {
  IDLE,
  UNAVAILABLE,
  SUCCESS,
  ERROR
}

export interface LoginErrorDetails {
  type: LoginErrorType,
  error?: string;
  description?: string;
}
export type LoginError = Error & LoginErrorDetails;

function createLoginError<T extends object>(type: LoginErrorType, error: string, description?: string, additionalData?: T): LoginError & T {
  let err: LoginError = new Error("LOGIN: returned error") as any;
  err.name = "LOGIN";
  err.type = type;
  err.error = error;
  err.description = description;
  additionalData && Object.assign(err, additionalData);
  return err as LoginError & T;
}


export enum DEPRECATED_LoginResult {
  success,
  passwordError,
  connectionError
}

// ACTION TYPES --------------------------------------------------------------------------------------

export const actionTypeRequestLogin = userConfig.createActionType("REQUEST_LOGIN");
export const actionTypeLoggedIn = userConfig.createActionType("LOGGED_IN");
export const actionTypeLoginError = userConfig.createActionType("LOGIN_ERROR");
export const actionTypeLoggedOut = userConfig.createActionType("LOGGED_OUT");
export const actionTypeLoginCancel = userConfig.createActionType("LOGIN_CANCEL");

// THUNKS -----------------------------------------------------------------------------------------

let checkingIOSPermissions = false;

export function loginAction(
  redirectOnError: boolean = false,
  credentials?: { username: string; password: string }
) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      // === 0: Init login
      try {
        if (!Conf.currentPlatform) throw new Error("[login] Must specify a platform");
        if (!OAuth2RessourceOwnerPasswordClient.connection)
          throw new Error("[login] no active oauth connection");

        dispatch({ type: actionTypeRequestLogin });
      } catch (err) {
        console.warn('[login] initialization failed');
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err);
      }

      // === 1: Get oAuth token from somewhere (server or local storage)
      try {
        if (credentials) {
          await OAuth2RessourceOwnerPasswordClient.connection.getNewToken(
            credentials.username,
            credentials.password,
            false // Do not save token until login is completely successful
          );
        } else {
          // Here, an offline user will try to load a token.
          // If a token is stored, it allows the user to be offline.
          await OAuth2RessourceOwnerPasswordClient.connection.loadToken();
          if (!OAuth2RessourceOwnerPasswordClient.connection.hasToken) {
            // No token, redirect to login page without error.
            dispatch(endSessionAction());
            navigate("LoginHome");
            return;
          }
        }
      } catch (err) {
        console.warn('[login] oauth error');
        throw err;
      }

      // === 2: Gather logged user information
      let userinfo2;
      try {
        userinfo2 = await fetchJSONWithCache("/auth/oauth2/userinfo", {
          headers: {
            Accept: "application/json;version=2.0"
          }
        }) as any;
        console.log("oauth2 userinfo back response", userinfo2);
        // console.log(userinfo2.apps);
        userinfo2.appsInfo = userinfo2.apps;
        userinfo2.apps = userinfo2.apps.map((e: any) => e.name);

        // Some applications haven't a precise name... 😫
        if (userinfo2.apps.includes("Cahier de texte"))
          userinfo2.apps.push("Homeworks");
        if (userinfo2.apps.includes("Espace documentaire"))
          userinfo2.apps.push("Workspace");
        if (userinfo2.apps.includes("Actualites")) userinfo2.apps.push("News");
        // console.log("apps: ", userinfo2.apps);
      } catch (err) {
        console.warn('[login] userinfo fetch failed');
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err);
      }

      // === 3: check user validity
      if (!userinfo2.hasApp) {
        const err = new Error("[loginAction]: User's structure is not premium.");
        (err as any).type = LoginFlowErrorType.NOT_PREMIUM;
        throw err;
      }

      // === 4: Gather another user information
      let userdata: any, userPublicInfo: any;
      try {
        userdata = await fetchJSONWithCache(
          `/directory/user/${userinfo2.userId}`
        ) as any;
        // console.log("childrenStructure", await fetchJSONWithCache('/directory/user/' + userinfo2.userId + '/children'));
        userdata.childrenStructure = userinfo2.type === "Relative" ?
          await (fetchJSONWithCache('/directory/user/' + userinfo2.userId + '/children') as any) :
          undefined;
        // console.log("oauth2 userdata", userdata);

        userPublicInfo = await fetchJSONWithCache("/userbook/api/person?id=" + userinfo2.userId);
        // console.log("oauth2 userPublicInfo", userPublicInfo);
      } catch (err) {
        console.warn('[login] userinfo fetch failed');
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err);
      }

      // === 4: Get firebase device token and store it in the backend
      let hasPermission;
      try {
        if (
          !checkingIOSPermissions &&
          Platform.OS === "ios" &&
          PushNotificationIOS
        ) {
          checkingIOSPermissions = true;
          PushNotificationIOS.checkPermissions(async (permissions: any) => { // ToDo : which type is that ?
            if (!permissions.alert || !permissions.badge || !permissions.sound) {
              await PushNotificationIOS.requestPermissions();
            }
            checkingIOSPermissions = false;
          });
        }
        hasPermission = await firebase.messaging().hasPermission();
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
      } catch (err) {
        console.warn('[login] firebase registering failed');
        throw createLoginError(LoginFlowErrorType.FIREBASE_ERROR, '', '', err);
      }

      // === 5: validate login
      try {
        dispatch({
          type: actionTypeLoggedIn,
          userbook: userinfo2,
          userdata,
          userPublicInfo: userPublicInfo.result[0]
        });
        OAuth2RessourceOwnerPasswordClient.connection.saveToken();
      } catch (err) {
        console.warn('[login] userinfo fetch failed');
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err);
      }

      // === 6: Tracking reporting (only on success)

      Tracking.logEvent("login", {
        isManual: credentials ? "true" : "false",
        platform: (Conf.currentPlatform as any).url
      });

      // === 7: navigate back to the main screen
      navigate("Main");
    } catch (err) {
      // In case of error...

      // === 1: Check if user is in activation mode
      if (err.type === OAuthErrorType.BAD_CREDENTIALS) {
        try {
          if (credentials) {
            const res = await fetch(
              `${(Conf.currentPlatform as any).url}/auth/activation/match`,
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
            if (res.ok) {
              const body = await res.json();
              if (body.match) {
                dispatch(
                  initActivationAccountAction(
                    {
                      activationCode: credentials.password,
                      login: credentials.username
                    },
                    true
                  )
                );
                return; // End error handling if activation match is a success
              }
            } else {
              console.warn(
                "[Login] activation code match fail with error code: ",
                res.status,
                res.statusText
              );
            }
          }
        } catch (activationErr) {
          console.warn('[activation] check failed:', activationErr);
        }
      }

      // === 2: Log error (Continue only if activation match failed)
      console.warn(err);
      Tracking.logEvent('failedLogin', {
        case: err.type,
        isManual: credentials ? "true" : "false",
        platform: (Conf.currentPlatform as any).url
      })

      // === 3: dispatch error
      dispatch({
        errmsg: err.type,
        type: actionTypeLoginError
      });

      // === 4: Redirect if asked
      if (redirectOnError) navigate("LoginHome");
    }
  };
}

function endSessionAction() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    if (!OAuth2RessourceOwnerPasswordClient.connection)
      throw new Error("[endSessionAction] no active oauth connection");
    // Unregister the device token from the backend
    await userService.unregisterFCMToken();
    // Erase stored oauth2 token and cache information
    await OAuth2RessourceOwnerPasswordClient.connection.eraseToken();
    // Validate log out
    dispatch({ type: actionTypeLoggedOut });
  }
}

export function logout() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");

      // === 0: Tracking reporting, only on manual logout
      Tracking.logEvent("logout", {
        platform: (Conf.currentPlatform as any).url
      });

      clearTimeline(dispatch)(); // ToDo: this is ugly. Timeline should be cleared when logout.

      // // === 1: End user session
      await dispatch(endSessionAction())
      await clearRequestsCache();
      dispatch(createEndSessionAction());

      // === 2: Nav back on the login screen
      navigate("LoginHome");
    } catch (err) {
      console.warn(err);
      navigate("LoginHome");
    }
  };
}

export function refreshToken(newToken: string) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const authState = getState().user.auth;
      if (!authState.loggingIn) return false;
      //
      await userService.unregisterFCMToken();
      //
      await userService.registerFCMToken(newToken as any);
      // console.log("Fcm Token (refresh put) :", newToken, putTokenResponse);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  };
}
