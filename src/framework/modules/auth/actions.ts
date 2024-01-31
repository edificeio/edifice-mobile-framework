import DeviceInfo from 'react-native-device-info';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { IAuthState, actions, assertSession, getState as getAuthState } from '~/framework/modules/auth/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import { StorageSlice } from '~/framework/util/storage/slice';
import { Trackers } from '~/framework/util/tracker';
import { clearRequestsCacheLegacy } from '~/infra/cache';
import { OAuth2RessourceOwnerPasswordClient, destroyOAuth2Legacy } from '~/infra/oauth';

import {
  IActivationPayload as ActivationPayload,
  AuthCredentials,
  AuthFederationCredentials,
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedAccount,
  ForgotMode,
  IActivationError,
  IChangePasswordError,
  IChangePasswordPayload,
  IForgotPayload,
  PlatformAuthContext,
  createActivationError,
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

const withMeasure = <Fn extends (...args: any[]) => any>(fn: Fn, tag?: string) => {
  return (async (...args: any) => {
    const start = Date.now();
    try {
      const ret = fn(...args);
      if (ret instanceof Promise) return await ret;
      else return ret;
    } finally {
      console.info(`[perf] ${tag ?? fn.toString()} in ${Date.now() - start}ms`);
    }
  }) as Fn;
};

const withErrorTracking = <Fn extends (...args: any[]) => any>(
  fn: Fn,
  category: string,
  action: string,
  name?: string,
  value?: number,
) => {
  return (async (...args: any) => {
    try {
      const ret = fn(...args);
      if (ret instanceof Promise) return await ret;
      else return ret;
    } catch (e) {
      Trackers.trackDebugEvent(category, action, name, value);
      throw e;
    }
  }) as Fn;
};

/**
 * Every step for login process is here.
 */
export const loginSteps = {
  /**
   * Get a new oAuth2 token set with given credentials
   * If bad credentials provided, check if this not the activation code / reset code
   */
  getNewToken: withErrorTracking(
    withMeasure(async (platform: Platform, credentials: AuthCredentials | AuthFederationCredentials) => {
      await createSession(platform, credentials);
    }, 'getNewToken'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.getToken',
  ),
  /**
   * Loads the saved token oAuth2 from the storage.
   * @param platform
   */
  loadToken: withErrorTracking(
    withMeasure(async (account: AuthSavedAccount) => {
      authService.restoreSession(appConf.assertPlatformOfName(account.platform), account.tokens);
    }, 'loadToken'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.loadToken',
  ),
  /**
   * Get one of the requirements needed by the user to access the app
   * @param platform
   * @returns
   */
  getRequirement: withErrorTracking(
    withMeasure(async (platform: Platform) => {
      return getRequirementScenario(await fetchRawUserRequirements(platform));
    }, 'getRequirement'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.getRequirements',
  ),
  /**
   * Retrives the user information from the backend
   * @param platform
   * @param requirement
   * @returns
   */
  getUserData: withErrorTracking(
    withMeasure(async (platform: Platform, requirement?: AuthRequirement) => {
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
    }, 'getUserData'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.getUserData',
  ),
  /**
   * Saves the new account information & registers tokens (fcm) into the backend
   * @param platform
   */
  finalizeSession: withErrorTracking(
    withMeasure(
      async (
        platform: Platform,
        loginUsed: string | undefined,
        userInfo: IUserInfoBackend,
        publicInfo: { userData?: UserPrivateData; userPublicInfo?: UserPersonDataBackend },
      ) => {
        await Promise.all([manageFirebaseToken(platform), forgetPlatform(), forgetPreviousSession()]);
        const { userData, userPublicInfo } = publicInfo;
        const sessionInfo = formatSession(platform, loginUsed, userInfo, userData, userPublicInfo);
        await StorageSlice.sessionInitAllStorages(sessionInfo);
        return sessionInfo;
      },
      'finalizeSession',
    ),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.confirmLogin',
  ),
  /**
   * Check password against activation and password renew codes.
   */
  checkActivationAndRenew: withErrorTracking(
    withMeasure(async (platform: Platform, credentials: AuthCredentials) => {
      try {
        const response = await Promise.any([
          authService.ensureCredentialsMatchActivationCode(platform, credentials),
          authService.ensureCredentialsMatchPwdRenewCode(platform, credentials),
        ]);
        return response;
      } catch (e) {
        if (e instanceof AggregateError) {
          const ee = e.errors.find(
            eee => Error.getDeepErrorType<typeof Error.LoginError>(eee as Error) !== Error.OAuth2ErrorType.CREDENTIALS_MISMATCH,
          );
          if (ee) throw ee;
          else throw e.errors.at(0);
        } else throw e;
      }
    }, 'checkActivationAndRenew'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.checkActivationAndRenew',
  ),
};

const requirementsThatNeedLegalUrls = [AuthRequirement.MUST_REVALIDATE_TERMS, AuthRequirement.MUST_VALIDATE_TERMS];

const performLogin = async (platform: Platform, loginUsed: string | undefined, dispatch: AuthDispatch) => {
  const requirement = await loginSteps.getRequirement(platform);
  const user = await loginSteps.getUserData(platform, requirement);
  const accountInfo = await loginSteps.finalizeSession(platform, loginUsed, user.infos, user.publicInfos);
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
export const loginCredentialsAction =
  (platform: Platform, credentials: AuthCredentials, key?: number) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      // Nested try/catch block to handle CREDENTIALS_MISMATCH errors caused by activation/renew code use.
      try {
        await loginSteps.getNewToken(platform, credentials);
        const session = await performLogin(platform, credentials.username, dispatch);
        writeSingleAccount(session, getAuthState(getState()).showOnboarding);
        return session;
      } catch (ee) {
        if (Error.getDeepErrorType<typeof Error.LoginError>(ee as Error) === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH) {
          switch (await loginSteps.checkActivationAndRenew(platform, credentials)) {
            case AuthPendingRedirection.ACTIVATE:
              dispatch(actions.redirectActivation(platform.name, credentials.username, credentials.password));
              break;
            case AuthPendingRedirection.RENEW_PASSWORD:
              dispatch(actions.redirectPasswordRenew(platform.name, credentials.username, credentials.password));
              break;
          }
        } else {
          throw ee;
        }
      }
    } catch (e) {
      console.warn(`[Auth] Login credentials error :`, e);
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
 * Manual login action with Federation.
 * @param platform platform info to create the session on.
 * @param saml saml assertion
 * @returns
 * @throws
 */
export const loginFederationAction =
  (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      await loginSteps.getNewToken(platform, credentials);
      const session = await performLogin(platform, undefined, dispatch);
      writeSingleAccount(session, getAuthState(getState()).showOnboarding);
      return session;
    } catch (e) {
      console.warn(`[Auth] Login federation error :`, e);
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
    if (!OAuth2RessourceOwnerPasswordClient.connection) {
      throw new Error.OAuth2Error(Error.OAuth2ErrorType.OAUTH2_MISSING_CLIENT);
    }
    await OAuth2RessourceOwnerPasswordClient.connection.refreshToken();
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
  let context: PlatformAuthContext | undefined;
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

export const activateAccountAction =
  (platform: Platform, model: ActivationPayload) => async (dispatch: ThunkDispatch<any, any, any>, getState) => {
    try {
      await authService.activateAccount(platform, model);
      Trackers.trackEvent('Auth', 'ACTIVATE');
      dispatch(
        loginCredentialsAction(platform, {
          username: model.login,
          password: model.password,
        }),
      );
    } catch (e) {
      console.warn(e);
      if ((e as IActivationError).name === 'EACTIVATION') throw e;
      else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e as object);
    }
  };

/**
 * Send reset mail for id or password
 * @param platform
 * @param userInfo
 * @param forgotMode
 * @returns
 */
export function forgotAction(platform: Platform, userInfo: IForgotPayload, forgotMode: ForgotMode) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
    const deviceId = getAuthState(getState()).deviceInfo.uniqueId;
    if (!deviceId) throw new global.Error('forgotAction: deviceId is undefined.');
    if (forgotMode === 'id') {
      return authService.forgot<'id'>(
        platform,
        forgotMode,
        {
          mail: userInfo.login,
          firstName: userInfo.firstName,
          structureId: userInfo.structureId,
        },
        deviceId,
      );
    } else {
      return authService.forgot<'password'>(
        platform,
        forgotMode,
        {
          login: userInfo.login,
        },
        deviceId,
      );
    }
  };
}

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
  oldPassword?: string;
  password: string;
  confirmPassword: string;
  login: string;
  callback: string;
  resetCode?: string;
}

export function changePasswordAction(platform: Platform, p: IChangePasswordPayload, forceChange?: boolean, rememberMe?: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      // === 2 - prepare chg pwd payload
      const payload: IChangePasswordSubmitPayload = {
        oldPassword: p.oldPassword,
        ...(p?.resetCode ? { resetCode: p?.resetCode } : {}),
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
    const credentials: AuthCredentials = {
      username: p.login,
      password: p.newPassword,
    };
    await dispatch(loginCredentialsAction(platform, credentials));
  };
}
