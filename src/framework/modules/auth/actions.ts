import DeviceInfo from 'react-native-device-info';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { IAuthState, actions, assertSession, getState as getAuthState } from '~/framework/modules/auth/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import { StorageSlice } from '~/framework/util/storage/slice';
import { Trackers } from '~/framework/util/tracker';
import { clearRequestsCacheLegacy } from '~/infra/cache';
import { destroyOAuth2Legacy } from '~/infra/oauth';

import {
  AuthRequirement,
  AuthSavedAccount,
  IAuthContext,
  IAuthCredentials,
  IChangePasswordError,
  IChangePasswordPayload,
  createChangePasswordError,
} from './model';
import * as authService from './service';
import {
  IUserInfoBackend,
  UserPersonDataBackend,
  UserPrivateData,
  createSession,
  ensureUserValidity,
  fetchRawUserRequirements,
  fetchUserInfo,
  fetchUserPublicInfo,
  forgetPlatform,
  forgetPreviousSession,
  formatSession,
  getAuthContext,
  getRequirementScenario,
  manageFirebaseToken,
  revalidateTerms,
} from './service';
import { readSavedAccounts, readSavedStartup, readShowOnbording, writeLogout, writeSingleAccount } from './storage';

type AuthDispatch = ThunkDispatch<IAuthState, any, AnyAction>;

// interface ILoginActionResultActivation {
//   action: 'activate';
//   credentials: IAuthCredentials;
//   rememberMe?: boolean;
//   context: IAuthContext;
// }
// interface ILoginActionResultPartialScenario {
//   action: AuthRequirement;
//   defaultMobile?: string;
//   defaultEmail?: string;
//   credentials?: IAuthCredentials;
//   rememberMe?: boolean;
//   context: IAuthContext;
// }
// export type ILoginResult = ILoginActionResultActivation | ILoginActionResultPartialScenario | void;

/**
 * Init the auth state with walues read from the storage.
 * @returns If exist, the startup account to try refresh session with.
 */
export const authInitAction = () => async (dispatch: AuthDispatch) => {
  const startup = readSavedStartup();
  const accounts = readSavedAccounts();
  const showOnboarding = readShowOnbording();
  const deviceId = await DeviceInfo.getUniqueId();

  dispatch(actions.authInit(startup, accounts, showOnboarding, deviceId));
  return startup ? (startup.account ? accounts[startup.account] : undefined) : undefined;
};

/**
 * fetch the auth context of current platform and stores it in redux.
 * @returns
 */
export const loadAuthContextAction = (platform: Platform) => async (dispatch: AuthDispatch) => {
  const context = await authService.getAuthContext(platform);
  if (!context) return;
  dispatch(actions.loadPfContext(platform.name, context));
  return context;
};

/**
 * fetchs the auth context of current platform and stores it in redux.
 * @returns
 */
export const loadPlatformLegalUrlsAction = (platform: Platform) => async (dispatch: AuthDispatch) => {
  const legalUrls = await authService.getAuthTranslationKeys(platform, I18n.getLanguage() as I18n.SupportedLocales);
  if (!legalUrls) return;
  dispatch(actions.loadPfLegalUrls(platform.name, legalUrls));
  return legalUrls;
};

/**
 * Get default infos
 * - Fetch appropriate validation infos if must be verified
 * - Return default mobile or email
 */
async function getRequirementAdditionalInfos(requirement: AuthRequirement, platform: Platform) {
  let defaultMobile: string | undefined;
  let defaultEmail: string | undefined;
  if (requirement === AuthRequirement.MUST_VERIFY_MOBILE) {
    const mobileValidationInfos = await authService.getMobileValidationInfos(platform.url);
    defaultMobile = mobileValidationInfos?.mobile;
  } else if (requirement === AuthRequirement.MUST_VERIFY_EMAIL) {
    const emailValidationInfos = await authService.getEmailValidationInfos(platform.url);
    defaultEmail = emailValidationInfos?.email;
  }
  return { defaultMobile, defaultEmail };
}

/**
 * Every step for login process is here.
 */
export const loginSteps = {
  /**
   * Get a new oAuth2 token set with given credentials
   * If bad credentials provided, check if this not the activation code /
   */
  getToken: async (platform: Platform, credentials: IAuthCredentials) => {
    const start = Date.now();
    try {
      await createSession(platform, credentials);
    } catch (e) {
      // if (credentials && authError?.type === OAuth2ErrorCode.BAD_CREDENTIALS) {}
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'loginSteps.getToken');
      throw e;
    } finally {
      console.info(`[perf] getToken in ${Date.now() - start}ms`);
    }
  },
  /**
   * Loads the saved token oAuth2 from the storage.
   * @param platform
   */
  loadToken: async (account: AuthSavedAccount) => {
    const start = Date.now();
    try {
      authService.restoreSession(appConf.assertPlatformOfName(account.platform), account.tokens);
    } catch (e) {
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'loginSteps.loadToken');
      throw e;
    } finally {
      console.info(`[perf] loadToken in ${Date.now() - start}ms`);
    }
  },
  /**
   * Get one of the requirements needed by the user to access the app
   * @param platform
   * @returns
   */
  getRequirement: async (platform: Platform) => {
    const start = Date.now();
    try {
      const userRequirements = await fetchRawUserRequirements(platform);
      return getRequirementScenario(userRequirements);
    } catch (e) {
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'loginSteps.getRequirements');
      throw e;
    } finally {
      console.info(`[perf] getRequirement in ${Date.now() - start}ms`);
    }
  },
  /**
   * Retrives the user information from the backend
   * @param platform
   * @param requirement
   * @returns
   */
  getUserData: async (platform: Platform, requirement?: AuthRequirement) => {
    const start = Date.now();
    try {
      const infos = await fetchUserInfo(platform);
      ensureUserValidity(infos);
      DeviceInfo.getUniqueId().then(uniqueID => {
        infos.uniqueId = uniqueID;
      });
      // If we have requirements, we can't fetch public info, we mock it instead.
      const { userdata, userPublicInfo } = requirement
        ? { userdata: undefined, userPublicInfo: undefined }
        : await fetchUserPublicInfo(infos, platform);
      return { infos, publicInfos: { userData: userdata, userPublicInfo } };
    } catch (e) {
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'loginSteps.getUserData');
      throw e;
    } finally {
      console.info(`[perf] getUserData in ${Date.now() - start}ms`);
    }
  },
  /**
   * Saves the new account information & registers tokens (fcm) into the backend
   * @param platform
   */
  finalizeLogin: async (
    platform: Platform,
    loginUsed: string,
    userInfo: IUserInfoBackend,
    publicInfo: { userData?: UserPrivateData; userPublicInfo?: UserPersonDataBackend },
    requirement?: AuthRequirement,
  ) => {
    const start = Date.now();
    try {
      await Promise.all([manageFirebaseToken(platform), forgetPlatform(), forgetPreviousSession()]);
      const { userData, userPublicInfo } = publicInfo;
      const sessionInfo = formatSession(platform, loginUsed, userInfo, userData, userPublicInfo);
      await StorageSlice.sessionInitAllStorages(sessionInfo);
      return sessionInfo;
    } catch (e) {
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'loginSteps.confirmLogin');
      throw e;
    } finally {
      console.info(`[perf] confirmLogin in ${Date.now() - start}ms`);
    }
  },
};

const requirementsThatNeedLegalUrls = [AuthRequirement.MUST_REVALIDATE_TERMS, AuthRequirement.MUST_VALIDATE_TERMS];

const performLogin = async (platform: Platform, loginUsed: string, dispatch: AuthDispatch) => {
  const requirement = await loginSteps.getRequirement(platform);
  const user = await loginSteps.getUserData(platform, requirement);
  const accountInfo = await loginSteps.finalizeLogin(platform, loginUsed, user.infos, user.publicInfos, requirement);
  if (requirement) {
    const context = await authService.getAuthContext(platform);
    const infos = await getRequirementAdditionalInfos(requirement, platform);
    accountInfo.user.mobile = infos.defaultMobile;
    accountInfo.user.email = infos.defaultEmail;
    if (requirementsThatNeedLegalUrls.includes(requirement)) {
      await dispatch(loadPlatformLegalUrlsAction(platform));
    }
    dispatch(actions.loginRequirement(accountInfo.user.id, accountInfo, requirement, context));
  } else {
    dispatch(actions.login(accountInfo.user.id, accountInfo));
  }
  return accountInfo;
};

/**
 * Manual login action with credentials by getting a fresh new token.
 * @param platform platform info to create the session on.
 * @param credentials login & password
 * @returns
 * @throws
 */
export const loginAction =
  (platform: Platform, credentials: IAuthCredentials, key: number) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      const activationScenario = await loginSteps.getToken(platform, credentials);
      // if (activationScenario) return activationScenario;
      const session = await performLogin(platform, credentials.username, dispatch);
      writeSingleAccount(session, getAuthState(getState()).showOnboarding);
      return session;
    } catch (e) {
      console.warn(`[Auth] Login error :`, e);
      dispatch(
        actions.authError({
          key,
          info: e as Error,
        }),
      );
      throw e;
    }
  };

/**
 * Automatic login action with given saved account information (and its serialized token).
 * @param account stored accound information
 * @returns
 * @throws
 */
export const restoreAction = (account: AuthSavedAccount) => async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
  try {
    await loginSteps.loadToken(account);
    const session = await performLogin(appConf.assertPlatformOfName(account.platform), account.user.loginUsed, dispatch);
    writeSingleAccount(session, getAuthState(getState()).showOnboarding);
    return session;
  } catch (e) {
    console.warn(`[Auth] Restore error :`, e);
    dispatch(
      actions.authError({
        key: undefined,
        info: e as Error,
      }),
    );
    throw e;
  }
};

/**
 * Marks the current error as displayed.
 */
export const consumeAuthErrorAction = (key: number) => (dispatch: AuthDispatch, getState: () => IGlobalState) => {
  const error = getAuthState(getState()).error;
  if (error) {
    error.key = key;
    dispatch(actions.authError(error));
  }
};

/**
 * Fetch again the logged user requirements and updates the store.
 * User needs to be logged.
 * @returns The new requirement if exists
 */
export const refreshRequirementsAction = () => async (dispatch: AuthDispatch) => {
  const session = assertSession();
  const requirement = await loginSteps.getRequirement(session.platform);
  const user = await loginSteps.getUserData(session.platform, requirement);
  const accountInfo = formatSession(
    session.platform,
    session.user.loginUsed,
    user.infos,
    user.publicInfos.userData,
    user.publicInfos.userPublicInfo,
  );
  let context: IAuthContext | undefined;
  if (requirement) {
    context = await getAuthContext(session.platform);
    if (requirementsThatNeedLegalUrls.includes(requirement)) {
      await dispatch(loadPlatformLegalUrlsAction(session.platform));
    }
  }
  dispatch(actions.updateRequirement(requirement, accountInfo, context));
};

/**
 * Revalidates terms for the current user and updates the store
 * @returns
 */
export const revalidateTermsAction = () => async (dispatch: AuthDispatch) => {
  const session = assertSession();
  await revalidateTerms(session);
  await dispatch(refreshRequirementsAction());
};

// /**
//  *
//  * @param platform
//  * @returns
//  */
// export function getLegalUrlsAction(platform: Platform) {
//   return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any): Promise<LegalUrls | undefined> {
//     // === 1: Load legal document urls
//     try {
//       const authTranslationKeys = await getAuthTranslationKeys(platform, I18n.getLanguage() as I18n.SupportedLocales);
//       dispatch(authActions.getLegalDocuments(legalUrls));
//       return legalUrls;
//     } catch (e) {
//       const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
//       if (authError?.type === RuntimeAuthErrorCode.LOAD_I18N_ERROR) {
//         // Do nothing, this kind of error is non-blocking
//       } else {
//         throw e;
//       }
//     }
//   };
// }

// /**
//  * Get token
//  * - Create new session and token if credentials are provided
//  * - Otherwise restore an existing session and token
//  * - Throw appropiate error if needed (if bad credentials, verify if it's an account activation process)
//  */
// function getTokenAction(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
//   return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any) {
//     try {
//       if (credentials) {
//         await createSession(platform, credentials);
//       } else {
//         const tokenData = await restoreSessionAvailable();
//         if (tokenData) {
//           await restoreSession(platform);
//         } else throw createAuthError(RuntimeAuthErrorCode.NO_TOKEN, 'No stored token', '');
//       }
//     } catch (e) {
//       const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
//       Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getToken');
//       if (credentials && authError?.type === OAuth2ErrorCode.BAD_CREDENTIALS) {
//         // ensureCredentialsMatchActivationCode is awaited before the two other because it throws auth errors
//         await ensureCredentialsMatchActivationCode(platform, credentials);
//         const [context] = await Promise.all([getAuthContext(platform), dispatch(getLegalUrlsAction(platform))]);
//         return { action: 'activate', context, credentials, rememberMe } as ILoginActionResultActivation;
//       }
//       throw e;
//     }
//   };
// }

// /**
//  * Get user data
//  * - Fetch user infos & verify data validity (no pending deletion, etc.)
//  * - Add unique device id
//  * - Fetch user public infos
//  * - Track & throw appropiate error if needed
//  */
// async function getUserData(platform: Platform, partialSessionScenario?: PartialSessionScenario) {
//   try {
//     const infos = await fetchUserInfo(platform);
//     ensureUserValidity(infos);
//     DeviceInfo.getUniqueId().then(uniqueID => {
//       infos.uniqueId = uniqueID;
//     });
//     // If we have requirements (=partialSessionScenario), we can't fetch public info, we mock it instead.
//     const { userdata, userPublicInfo } = partialSessionScenario
//       ? { userdata: undefined, userPublicInfo: undefined }
//       : await fetchUserPublicInfo(infos, platform);
//     return { infos, publicInfos: { userData: userdata, userPublicInfo } };
//   } catch (e) {
//     Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getUserData');
//     throw e;
//   }
// }

// /**
//  * Handle session
//  * - Initialize firebase token
//  * - Save selected platform
//  * - Forget previous session
//  * - Save session if needed
//  * - Track & throw appropiate error if needed
//  */
// async function handleSession(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
//   try {
//     await Promise.all([initFirebaseToken(platform), savePlatform(platform), forgetPreviousSession()]);
//     const mustSaveSession = !credentials || rememberMe || platform.wayf;
//     if (mustSaveSession) await saveSession();
//     return mustSaveSession;
//   } catch (e) {
//     Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'handleSession');
//     throw e;
//   }
// }

// /**
//  * Get user conditions
//  * - Fetch legal url's
//  * - Fetch user requirements
//  * - Return partial session scenario if needed (terms validation, mobile verification, etc.)
//  * - Track & throw appropiate error if needed
//  */
// async function getUserConditions(platform: Platform, dispatch: ThunkDispatch<any, any, any>) {
//   try {
//     const [userRequirements] = await Promise.all([fetchUserRequirements(platform), dispatch(getLegalUrlsAction(platform))]);
//     const partialSessionScenario = getPartialSessionScenario(userRequirements);
//     return partialSessionScenario;
//   } catch (e) {
//     Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getUserConditions');
//     throw e;
//   }
// }

// /**
//  * Handle login redirection
//  * - Fetch default data (email or mobile validation infos) and auth context in case of partial session scenario
//  * - Dispatch and return login redirection infos
//  * - Track & throw appropiate error if needed
//  */
// function handleLoginRedirection(
//   platform: Platform,
//   userInfo: IUserInfoBackend,
//   publicInfo: { userData?: UserPrivateData; userPublicInfo?: UserPersonDataBackend },
//   mustSaveSession?: string | boolean,
//   partialSessionScenario?: PartialSessionScenario,
//   credentials?: IAuthCredentials,
//   rememberMe?: boolean,
// ) {
//   return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any) {
//     try {
//       const { userData, userPublicInfo } = publicInfo;
//       const sessionInfo = formatSession(platform, userInfo, userData, userPublicInfo, !!mustSaveSession);
//       await StorageSlice.sessionInitAllStorages(sessionInfo);
//       if (partialSessionScenario) {
//         const { defaultMobile, defaultEmail } = await getDefaultInfos(partialSessionScenario, platform.url);
//         const context = await getAuthContext(platform);
//         dispatch(authActions.sessionPartial(sessionInfo));
//         return { action: partialSessionScenario, defaultEmail, defaultMobile, context, credentials, rememberMe };
//       } else {
//         dispatch(authActions.sessionCreate(sessionInfo));
//       }
//     } catch (e) {
//       Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'handleLoginRedirection');
//       throw e;
//     }
//   };
// }

// /**
//  * Track login
//  * - Track login completion (including login type and partial session scenario)
//  * - Track & throw appropiate error if needed
//  */
// async function trackLogin(credentials?: IAuthCredentials, partialSessionScenario?: PartialSessionScenario) {
//   try {
//     await Trackers.trackEvent('Auth', credentials ? 'LOGIN' : 'RESTORE', partialSessionScenario);
//   } catch (e) {
//     Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'trackLogin');
//     throw e;
//   }
// }

// export function loginAction(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
//   return async function (dispatch: ThunkDispatch<any, any, any>): Promise<ILoginResult> {
//     try {
//       // 1. Get token from session (created/restored)
//       // (exit loginAction and redirect to activation if needed)
//       const activationScenario = await dispatch(getTokenAction(platform, credentials, rememberMe));
//       if (activationScenario) return activationScenario;

//       // 2. Get user conditions (legal urls, requirements)
//       const partialSessionScenario = await getUserConditions(platform, dispatch);

//       // 3. Get user data (personal infos, validity, device id, public infos)
//       const user = await getUserData(platform, partialSessionScenario);

//       // 4. Handle session (firebase, platform, save)
//       const mustSaveSession = await handleSession(platform, credentials, rememberMe);

//       // 5. Handle login redirection (partial/complete)
//       const redirectScenario = await dispatch(
//         handleLoginRedirection(
//           platform,
//           user.infos,
//           user.publicInfos,
//           mustSaveSession,
//           partialSessionScenario,
//           credentials,
//           rememberMe,
//         ),
//       );

//       // 6. Track login (initial/restored)
//       await trackLogin(credentials, partialSessionScenario);

//       // 7. Import xmas theme
//       await dispatch(importXmasThemeAction());

//       return redirectScenario;
//     } catch (e) {
//       const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
//       // Don't show error message if no stored token is found
//       if (authError?.type === RuntimeAuthErrorCode.NO_TOKEN) return undefined;
//       await Trackers.trackEvent('Auth', 'LOGIN ERROR', authError?.type);
//       dispatch(authActions.sessionError(authError?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
//       throw e;
//     }
//   };
// }

// interface IActivationSubmitPayload extends IActivationPayload {
//   callBack: string;
//   theme: string;
// }

// // ToDo : move following API calls to a service
// export function activateAccountAction(platform: Platform, model: IActivationPayload, rememberMe?: boolean) {
//   return async (dispatch: ThunkDispatch<any, any, any>, getState) => {
//     try {
//       // === 0 auto select the default theme
//       const theme = platform.webTheme;
//       if (!theme && __DEV__) console.debug('[User][Activation] activationAccount -> theme was not found:', platform.webTheme);
//       // === 1 - prepare payload
//       const payload: IActivationSubmitPayload = {
//         acceptCGU: true,
//         activationCode: model.activationCode,
//         callBack: '',
//         login: model.login,
//         password: model.password,
//         confirmPassword: model.confirmPassword,
//         mail: model.mail || '',
//         phone: model.phone,
//         theme,
//       };
//       const formdata = new FormData();
//       for (const key in payload) {
//         formdata.append(key, payload[key]);
//       }
//       // === 2 - Send activation information
//       const res = await fetch(`${platform.url}/auth/activation/no-login`, {
//         body: formdata,
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'multipart/form-data',
//           'X-Device-Id': uniqueId(),
//         },
//         method: 'post',
//       });
//       // === 3 - Check whether the activation was successful
//       if (!res.ok) {
//         throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'));
//       }
//       // a json response can contains an error field
//       if (res.headers.get('content-type')?.indexOf('application/json') !== -1) {
//         // checking response header
//         const resBody = await res.json();
//         if (resBody.error) {
//           throw createActivationError('activation', resBody.error.message);
//         }
//       }

//       // === Bonus : clear cookies. The backend sends back a Set-Cookie header that conflicts with the oAuth2 token.
//       await CookieManager.clearAll();
//       // ToDo : what to do if clearing the cookies doesn't work ? The user will be stuck with that cookie and will be logged to that account forever and ever ! 😱

//       // === 4 - call thunk login using login/password
//       const redirect = await dispatch(
//         loginAction(
//           platform,
//           {
//             username: model.login,
//             password: model.password,
//           },
//           rememberMe,
//         ),
//       );
//       // === 5 - Tracking
//       Trackers.trackEvent('Auth', 'ACTIVATE');
//       return redirect;
//     } catch (e) {
//       if ((e as IActivationError).name === 'EACTIVATION') throw e;
//       else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e as object);
//     }
//   };
// }

// /**
//  * Send reset mail for id or password
//  * @param platform
//  * @param userInfo
//  * @param forgotMode
//  * @returns
//  * ToDo : type the return value
//  */
// export function forgotAction(platform: Platform, userInfo: IForgotPayload, forgotMode: ForgotMode) {
//   return async (dispatch: ThunkDispatch<any, any, any>) => {
//     const payLoad =
//       forgotMode === 'id'
//         ? {
//             mail: userInfo.login,
//             firstName: userInfo.firstName,
//             structureId: userInfo.structureId,
//             service: 'mail',
//           }
//         : {
//             login: userInfo.login,
//             service: 'mail',
//           };
//     const api = `${platform.url}/auth/forgot-${forgotMode === 'id' ? 'id' : 'password'}`;
//     const res = await fetch(api, {
//       body: JSON.stringify(payLoad),
//       method: 'POST',
//       headers: {
//         'X-Device-Id': uniqueId(),
//         'Content-Type': 'application/json',
//       },
//     });
//     const resStatus = res.status;
//     const resJson = await res.json();
//     const ok = resStatus >= 200 && resStatus < 300;
//     const response = { ...resJson, ok };
//     return response;
//   };
// }

/** Action that erases the session without Tracking anything. */
export function quietLogoutAction() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // Unregister the device token from the backend
    const account = assertSession();
    await authService.removeFirebaseToken(account.platform);
    // Erase requests cache
    await clearRequestsCacheLegacy();
    // Erase stored oauth2 token and cache information
    await destroyOAuth2Legacy();
    // Writes new storage values
    writeLogout(account);
    // Validate log out
    dispatch(actions.logout());
    dispatch(createEndSessionAction()); // flush sessionReducers
  };
}

// /** Action that invalidates the session without Tracking anything in case of error.
//  * This removes FCM and takes the user to the auth stack.
//  */
// export function sessionInvalidateAction(platform: Platform, error?: AuthError) {
//   return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
//     // Unregister the device token from the backend
//     await removeFirebaseToken(platform);
//     // Validate log out
//     dispatch(authActions.sessionError(error?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
//     dispatch(createEndSessionAction()); // flush sessionReducers
//   };
// }

/** Clear the current session and track logout event.
 * Session must exist and this action will throw if no session is active.
 */
export function manualLogoutAction() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    await dispatch(quietLogoutAction());
    Trackers.trackEvent('Auth', 'LOGOUT');
  };
}

export interface IChangePasswordSubmitPayload {
  oldPassword: string;
  password: string;
  confirmPassword: string;
  login: string;
  callback: string;
}

export function changePasswordAction(platform: Platform, p: IChangePasswordPayload, forceChange?: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      // === 2 - prepare chg pwd payload
      const payload: IChangePasswordSubmitPayload = {
        oldPassword: p.oldPassword,
        password: p.newPassword,
        confirmPassword: p.confirm,
        login: p.login,
        callback: '',
        ...(forceChange ? { forceChange: 'force' } : {}),
      };
      const formdata = new FormData();
      for (const key in payload) {
        formdata.append(key, payload[key as keyof IChangePasswordSubmitPayload]);
      }
      // === 3 - Send change password information
      const deviceId = getAuthState(getState()).deviceInfo.uniqueId;
      if (!deviceId) {
        throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
      }
      const res = await fetch(`${platform.url}/auth/reset`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-Device-Id': deviceId,
        },
        method: 'post',
      });
      // === 3 - Check whether the password change was successful
      if (!res.ok) {
        throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
      }
      // a json response can contains an error field
      if (res.headers.get('content-type') && res.headers.get('content-type')!.indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          const pwdRegex = getState().user.changePassword?.context?.passwordRegex;
          const regexp = new RegExp(pwdRegex);
          if (pwdRegex && !regexp.test(p.newPassword)) {
            throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-regex'));
          } else {
            throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-fields'));
          }
        }
      }

      Trackers.trackEvent('Profile', 'CHANGE PASSWORD');
    } catch (e) {
      Trackers.trackEvent('Profile', 'CHANGE PASSWORD ERROR');
      if ((e as IChangePasswordError).name === 'ECHANGEPWD') throw e;
      else throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
    }

    // 4 === Login back to get renewed token
    const credentials: IAuthCredentials = {
      username: p.login,
      password: p.newPassword,
    };
    await dispatch(loginAction(platform, credentials));
  };
}
