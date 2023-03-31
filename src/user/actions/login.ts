import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import messaging from '@react-native-firebase/messaging';
import I18n from 'i18n-js';
import { NavigationActions } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import {
  IUserRequirements,
  getEmailValidationInfos,
  getMobileValidationInfos,
  getUserRequirements,
} from '~/framework/modules/auth/service';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { clearRequestsCache, fetchJSONWithCache } from '~/infra/fetchWithCache';
import { OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient, uniqueId, urlSigner } from '~/infra/oauth';
import { createEndSessionAction } from '~/infra/redux/reducerFactory';
import { getLoginStackToDisplay } from '~/navigation/helpers/loginRouteName';
import { navigate, reset, resetNavigation } from '~/navigation/helpers/navHelper';
import { LegalUrls } from '~/user/reducers/auth';
import { IEntcoreEmailValidationInfos, IEntcoreMobileValidationInfos, Languages, userService } from '~/user/service';

import { actionTypeLegalDocuments } from './actionTypes/legalDocuments';
import {
  actionTypeLoggedIn,
  actionTypeLoggedInPartial,
  actionTypeLoggedOut,
  actionTypeLoginCancel,
  actionTypeLoginError,
  actionTypeRequestLogin,
} from './actionTypes/login';
import { initActivationAccount as initActivationAccountAction } from './initActivation';
import { PLATFORM_STORAGE_KEY } from './platform';
import { letItSnowAction } from './xmas';

export enum LoginFlowErrorType {
  RUNTIME_ERROR = 'runtime_error',
  FIREBASE_ERROR = 'firebase_error',
  NOT_PREMIUM = 'not_premium',
  PRE_DELETED = 'pre_deleted',
  MUST_CHANGE_PASSWORD = 'must-change-password',
  MUST_REVALIDATE_TERMS = 'must-revalidate-terms',
  MUST_VERIFY_EMAIL = 'must-verify-email',
  MUST_VERIFY_MOBILE = 'must-verify-mobile',
}
export type LoginErrorType = OAuth2ErrorCode | LoginFlowErrorType;

export enum LoginStatus {
  IDLE,
  UNAVAILABLE,
  SUCCESS,
  ERROR,
}

export interface LoginErrorDetails {
  type: LoginErrorType;
  error?: string;
  description?: string;
}

export type LoginError = Error & LoginErrorDetails;

export function createLoginError<T extends object>(
  type: LoginErrorType,
  error: string,
  description?: string,
  additionalData?: T,
): LoginError & T {
  const err: LoginError = new Error('LOGIN: returned error') as any;
  err.name = 'LOGIN';
  err.type = type;
  err.error = error;
  err.description = description;
  if (additionalData) Object.assign(err, additionalData);
  return err as LoginError & T;
}

export enum DEPRECATEDLoginResult {
  success,
  passwordError,
  connectionError,
}

function endSessionAction() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[endSessionAction] no active oauth connection');
    // Unregister the device token from the backend
    await userService.unregisterFCMToken();
    // Erase stored oauth2 token and cache information
    await OAuth2RessourceOwnerPasswordClient.connection.eraseToken();
    // Validate log out
    dispatch({ type: actionTypeLoggedOut });
  };
}

export function loginAction(
  redirectOnError: boolean = false,
  credentials?: { username: string; password: string; rememberMe?: boolean },
) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const pf = DEPRECATED_getCurrentPlatform();
    try {
      // === 0: Init login
      try {
        if (!pf) throw new Error('[login] Must specify a platform');
        if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[login] no active oauth connection');

        dispatch({ type: actionTypeRequestLogin });
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err as Error);
      }

      // === 1: Load legal document urls
      const legalUrls: LegalUrls = {
        userCharter: undefined,
        cgu: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.cgu')),
        personalDataProtection: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.personalDataProtection')),
        cookies: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.cookies')),
      };
      try {
        const authTranslationKeys = await userService.getAuthTranslationKeys(I18n.locale as Languages);
        if (authTranslationKeys) {
          legalUrls.userCharter = urlSigner.getAbsoluteUrl(
            authTranslationKeys['auth.charter'] || I18n.t('user.legalUrl.userCharter'),
          );
        }
      } catch (err) {
        console.warn(err);
      }
      dispatch({ type: actionTypeLegalDocuments, legalUrls });

      // === 2: Get oAuth token from somewhere (server or local storage)
      if (credentials) {
        await OAuth2RessourceOwnerPasswordClient.connection.getNewTokenWithUserAndPassword(
          credentials.username,
          credentials.password,
          false, // Do not save token until login is completely successful
        );
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await OAuth2RessourceOwnerPasswordClient.connection.loadToken();
        if (!OAuth2RessourceOwnerPasswordClient.connection.hasToken) {
          // No token, redirect to login page without error.
          dispatch(endSessionAction());
          const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
          reset(getLoginStackToDisplay(platformId));
          return;
        }
      }

      // === 3: Gather logged user information
      let userinfo2;
      try {
        userinfo2 = (await fetchJSONWithCache('/auth/oauth2/userinfo', {
          headers: {
            Accept: 'application/json;version=2.0',
          },
        })) as any;
        userinfo2.appsInfo = userinfo2.apps;
        userinfo2.apps = userinfo2.apps.map((e: any) => e.name);
        // Some applications haven't a precise name... ☹️
        if (userinfo2.apps.includes('Cahier de texte')) userinfo2.apps.push('Homeworks');
        if (userinfo2.apps.includes('Espace documentaire')) userinfo2.apps.push('Workspace');
        if (userinfo2.apps.includes('Actualites')) userinfo2.apps.push('News');
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err as Error);
      }

      // === 3: Gather user mandatory context
      let requirements: IUserRequirements | null = null;
      try {
        requirements = await getUserRequirements(platform);
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err as Error);
      }

      // === 5: check user validity
      if (userinfo2.deletePending) {
        const err = new Error('[loginAction]: User is predeleted.');
        (err as any).type = LoginFlowErrorType.PRE_DELETED;
        throw err;
      } else if (!userinfo2.hasApp) {
        const err = new Error("[loginAction]: User's structure is not premium.");
        (err as any).type = LoginFlowErrorType.NOT_PREMIUM;
        throw err;
      } else if (requirements?.forceChangePassword) {
        const err = new Error('[loginAction]: User must change password.');
        (err as any).type = LoginFlowErrorType.MUST_CHANGE_PASSWORD;
        (err as any).userinfo2 = userinfo2;
        throw err;
      } else if (requirements?.needRevalidateMobile) {
        const err = new Error('[loginAction]: User must verify mobile.');
        try {
          const mobileValidationInfos = await getMobileValidationInfos();
          (err as any).type = LoginFlowErrorType.MUST_VERIFY_MOBILE;
          (err as any).mobileValidationInfos = {
            ...mobileValidationInfos,
          } as IEntcoreMobileValidationInfos;
        } catch (e) {
          throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', e as Error);
        }
        throw err;
      } else if (requirements?.needRevalidateEmail) {
        const err = new Error('[loginAction]: User must verify email.');
        try {
          const emailValidationInfos = await getEmailValidationInfos();
          (err as any).type = LoginFlowErrorType.MUST_VERIFY_EMAIL;
          (err as any).emailValidationInfos = {
            ...emailValidationInfos,
          } as IEntcoreEmailValidationInfos;
        } catch (e) {
          throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', e as Error);
        }
        throw err;
      } else if (requirements?.needRevalidateTerms) {
        const err = new Error('[loginAction]: User must revalidate terms.');
        (err as any).type = LoginFlowErrorType.MUST_REVALIDATE_TERMS;
        throw err;
      }

      // === 6: Gather more user information
      let userdata: any, userPublicInfo: any;
      try {
        userdata = (await fetchJSONWithCache(`/directory/user/${userinfo2.userId}`)) as any;
        userdata.childrenStructure =
          userinfo2.type === 'Relative'
            ? await (fetchJSONWithCache('/directory/user/' + userinfo2.userId + '/children') as any)
            : undefined;

        userPublicInfo = await fetchJSONWithCache('/userbook/api/person?id=' + userinfo2.userId);
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err as Error);
      }

      // === 7: Get firebase device token and store it in the backend
      try {
        const authorizationStatus = await messaging().requestPermission();
        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          await userService.registerFCMToken();
        }
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.FIREBASE_ERROR, '', '', err as Error);
      }

      // === 8: validate login
      try {
        dispatch({
          type: actionTypeLoggedIn,
          userbook: userinfo2,
          userdata,
          userPublicInfo: userPublicInfo.result[0],
        });
        if (credentials?.rememberMe || pf.wayf) OAuth2RessourceOwnerPasswordClient.connection.saveToken();
      } catch (err) {
        throw createLoginError(LoginFlowErrorType.RUNTIME_ERROR, '', '', err as Error);
      }

      // === 9: Tracking reporting (only on success)

      // ToDo
      await Promise.all([
        Trackers.setUserId(userinfo2.userId),
        Trackers.setCustomDimension(1, 'Profile', userinfo2.type),
        Trackers.setCustomDimension(
          2,
          'School',
          userinfo2.administrativeStructures && userinfo2.administrativeStructures.length
            ? userinfo2.administrativeStructures[0].id
            : userinfo2.structures && userinfo2.structures.length
            ? userinfo2.structures[0]
            : 'no structure',
        ),
        Trackers.setCustomDimension(3, 'Project', pf!.url.replace(/(^\w+:|^)\/\//, '')), // remove protocol
      ]);
      if (credentials) await Trackers.trackEvent('Auth', 'LOGIN');
      // Track manual login (with credentials)
      else await Trackers.trackDebugEvent('Auth', 'RESTORE'); // track separately auto login (with stored token)

      // === 10: Store Current Platform
      await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, pf.name);

      // === 11: navigate back to the main screen
      navigate('Main');
      dispatch(letItSnowAction());
    } catch (err) {
      // In case of error...
      let routeToGo;
      let routeParams;
      // === 1: Check if user is in activation mode
      if ((err as any).type === OAuth2ErrorCode.BAD_CREDENTIALS) {
        try {
          if (credentials) {
            const res = await fetch(`${pf!.url}/auth/activation/match`, {
              body: JSON.stringify({
                login: credentials.username,
                password: credentials.password,
              }),
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Device-Id': uniqueId(),
              },
              method: 'post',
            });
            if (res.ok) {
              const body = await res.json();
              if (body.match) {
                dispatch({ type: actionTypeLoginCancel });
                dispatch(
                  initActivationAccountAction(
                    {
                      activationCode: credentials.password,
                      login: credentials.username,
                    },
                    true,
                    credentials?.rememberMe,
                  ),
                );
                return; // End error handling if activation match is a success
              }
            }
          }
        } catch {
          // TODO: Manage error
        } finally {
          CookieManager.clearAll();
        }
      } else if ((err as any).type === LoginFlowErrorType.MUST_CHANGE_PASSWORD) {
        routeToGo = 'ChangePassword';
      } else if ((err as any).type === LoginFlowErrorType.MUST_REVALIDATE_TERMS) {
        routeToGo = 'RevalidateTerms';
        routeParams = { credentials };
      } else if ((err as any).type === LoginFlowErrorType.MUST_VERIFY_MOBILE) {
        routeToGo = 'UserMobile';
        routeParams = { credentials, defaultMobile: (err as any)?.mobileValidationInfos?.mobile };
      } else if ((err as any).type === LoginFlowErrorType.MUST_VERIFY_EMAIL) {
        routeToGo = 'UserEmail';
        routeParams = { credentials, defaultEmail: (err as any)?.emailValidationInfos?.email };
      }

      if (routeToGo) {
        if (credentials) {
          navigate(routeToGo, routeParams);
        } else {
          /*resetNavigation(
            [
              ...(AppConf.platforms && AppConf.platforms.length > 1
                ? [NavigationActions.navigate({ routeName: 'PlatformSelect' })]
                : []),
              NavigationActions.navigate({ routeName: getLoginRouteName() }),
              NavigationActions.navigate({ routeName: routeToGo }),
            ],
            2,
          );*/
          const stack = getLoginStackToDisplay(pf!.name);
          stack.push(NavigationActions.navigate({ routeName: routeToGo }));
          resetNavigation(stack, stack.length - 1);
        }
        dispatch({
          type: actionTypeLoggedInPartial,
          userbook: (err as any).userinfo2,
        });
      } else {
        // ToDo Tracking

        // === 2: dispatch error
        dispatch({
          type: actionTypeLoginError,
          errmsg: (err as any).type,
        });

        // Track

        if (credentials) await Trackers.trackEvent('Auth', 'LOGIN ERROR', (err as any).type);
        // Track manual login (with credentials)
        else await Trackers.trackEvent('Auth', 'RESTORE ERROR', (err as any).type); // track separately auto login (with stored token)

        // === 3: Redirect if asked
        if (redirectOnError) {
          /*resetNavigation(
            [
              ...(AppConf.platforms && AppConf.platforms.length > 1
                ? [NavigationActions.navigate({ routeName: 'PlatformSelect' })]
                : []),
              NavigationActions.navigate({ routeName: getLoginRouteName() }),
            ],
            1,
          );*/
          const stack = getLoginStackToDisplay(pf!.name);
          resetNavigation(stack, stack.length - 1);
        }
      }
    } finally {
      // TODO: Manage Error
    }
  };
}

export function logout() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');

      // === 1: Nav back on the login stack
      const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
      reset(getLoginStackToDisplay(platformId));

      // === 2: End user session
      await dispatch(endSessionAction());
      await clearRequestsCache();
      dispatch(createEndSessionAction());

      // === 3: Tracking
      Trackers.trackEvent('Auth', 'LOGOUT');
    } catch {
      const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
      reset(getLoginStackToDisplay(platformId));
    }
  };
}

export function refreshToken(newToken: string) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');
      const authState = getState().user.auth;
      if (!authState.loggingIn) return false;
      await userService.unregisterFCMToken();
      await userService.registerFCMToken(newToken as any);
    } catch {
      // TODO: Manage error
    }
  };
}

export async function redirectAfterChangePassword(dispatch) {
  dispatch({
    type: actionTypeLoginError,
    errmsg: 'must_log_again',
    errtype: 'warning',
  });
  /*resetNavigation(
    [
      ...(AppConf.platforms && AppConf.platforms.length > 1 ? [NavigationActions.navigate({ routeName: 'PlatformSelect' })] : []),
      NavigationActions.navigate({ routeName: getLoginRouteName() }),
    ],
    1,
  );*/
  const stack = getLoginStackToDisplay(DEPRECATED_getCurrentPlatform()!.name);
  resetNavigation(stack, stack.length - 1);
}
