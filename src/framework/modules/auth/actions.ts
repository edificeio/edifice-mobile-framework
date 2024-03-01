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
  AuthSavedAccountWithTokens,
  ForgotMode,
  IActivationError,
  IChangePasswordError,
  IChangePasswordPayload,
  IForgotPayload,
  PlatformAuthContext,
  accountIsLogged,
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
import {
  getSerializedLoggedInAccountInfo,
  readSavedAccounts,
  readSavedStartup,
  readShowOnbording,
  writeLogout,
  writeNewAccount,
} from './storage';

type AuthDispatch = ThunkDispatch<IAuthState, any, AnyAction>;

/**
 * Init the auth state with walues read from the storage.
 * @returns If exist, the startup account to try refresh session with.
 */
export const authInitAction = () => async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
  const startup = readSavedStartup();
  const accounts = readSavedAccounts();
  const showOnboarding = readShowOnbording();
  const deviceId = await DeviceInfo.getUniqueId();

  dispatch(actions.authInit(startup, accounts, showOnboarding, deviceId));
  const authState = getAuthState(getState());
  const ret =
    authState.pending && authState.pending.redirect === undefined && authState.pending.account
      ? authState.accounts[authState.pending.account]
      : undefined;
  if (accountIsLogged(ret)) {
    return getSerializedLoggedInAccountInfo(ret);
  } else return ret;
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
    withMeasure(async (account: AuthSavedAccountWithTokens) => {
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
        Trackers.setUserId(sessionInfo.user.id);
        Trackers.setCustomDimension(1, 'Profile', sessionInfo.user.type.toString());
        Trackers.setCustomDimension(3, 'Project', new URL(sessionInfo.platform.url).hostname);
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

const performLogin = async (
  redux: {
    success: typeof actions.login;
    requirement: typeof actions.loginRequirement;
  },
  platform: Platform,
  loginUsed: string | undefined,
  dispatch: AuthDispatch,
) => {
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
    dispatch(redux.requirement(accountInfo.user.id, accountInfo, requirement, context));
  } else {
    dispatch(redux.success(accountInfo.user.id, accountInfo));
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
const loginCredentialsAction =
  (
    redux: {
      success: typeof actions.login;
      requirement: typeof actions.loginRequirement;
      activation: typeof actions.redirectActivation;
      passwordRenew: typeof actions.redirectPasswordRenew;
    },
    storageFn: typeof writeNewAccount,
    platform: Platform,
    credentials: AuthCredentials,
    key?: number,
  ) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      // Nested try/catch block to handle CREDENTIALS_MISMATCH errors caused by activation/renew code use.
      try {
        await loginSteps.getNewToken(platform, credentials);
        const session = await performLogin(redux, platform, credentials.username, dispatch);
        storageFn(session, getAuthState(getState()).showOnboarding);
        return session;
      } catch (ee) {
        if (Error.getDeepErrorType<typeof Error.LoginError>(ee as Error) === Error.OAuth2ErrorType.CREDENTIALS_MISMATCH) {
          switch (await loginSteps.checkActivationAndRenew(platform, credentials)) {
            case AuthPendingRedirection.ACTIVATE:
              dispatch(redux.activation(platform.name, credentials.username, credentials.password));
              return AuthPendingRedirection.ACTIVATE;
            case AuthPendingRedirection.RENEW_PASSWORD:
              dispatch(redux.passwordRenew(platform.name, credentials.username, credentials.password));
              return AuthPendingRedirection.RENEW_PASSWORD;
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

export const loginCredentialsActionMainAccount = (platform: Platform, credentials: AuthCredentials, key?: number) =>
  loginCredentialsAction(
    {
      success: actions.login,
      requirement: actions.loginRequirement,
      activation: actions.redirectActivation,
      passwordRenew: actions.redirectPasswordRenew,
    },
    writeNewAccount,
    platform,
    credentials,
    key,
  );

export const loginCredentialsActionAddAccount = (platform: Platform, credentials: AuthCredentials, key?: number) =>
  loginCredentialsAction(
    {
      success: actions.addAccount,
      requirement: actions.addAccountRequirement,
      activation: actions.addAccountActivation,
      passwordRenew: actions.addAccountPasswordRenew,
    },
    writeNewAccount,
    platform,
    credentials,
    key,
  );

/**
 * Manual login action with Federation.
 * @param platform platform info to create the session on.
 * @param saml saml assertion
 * @returns
 * @throws
 */
const loginFederationAction =
  (
    redux: {
      success: typeof actions.login;
      requirement: typeof actions.loginRequirement;
      activation: typeof actions.redirectActivation;
      passwordRenew: typeof actions.redirectPasswordRenew;
    },
    storageFn: typeof writeNewAccount,
    platform: Platform,
    credentials: AuthFederationCredentials,
    key?: number,
  ) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      await loginSteps.getNewToken(platform, credentials);
      const session = await performLogin(redux, platform, undefined, dispatch);
      storageFn(session, getAuthState(getState()).showOnboarding);
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

export const loginFederationActionMainAccount = (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  loginFederationAction(
    {
      success: actions.login,
      requirement: actions.loginRequirement,
      activation: actions.redirectActivation,
      passwordRenew: actions.redirectPasswordRenew,
    },
    writeNewAccount,
    platform,
    credentials,
    key,
  );

export const loginFederationActionAddAccount = (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  loginFederationAction(
    {
      success: actions.addAccount,
      requirement: actions.addAccountRequirement,
      activation: actions.addAccountActivation,
      passwordRenew: actions.addAccountPasswordRenew,
    },
    writeNewAccount,
    platform,
    credentials,
    key,
  );

/**
 * Automatic login action with given saved account information (and its serialized token).
 * @param account stored accound information
 * @returns
 * @throws
 */
export const restoreAction =
  (account: AuthSavedAccountWithTokens) => async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      await loginSteps.loadToken(account);
      if (!OAuth2RessourceOwnerPasswordClient.connection) {
        throw new Error.OAuth2Error(Error.OAuth2ErrorType.OAUTH2_MISSING_CLIENT);
      }
      await OAuth2RessourceOwnerPasswordClient.connection.refreshToken();
      const session = await performLogin(
        {
          success: actions.login,
          requirement: actions.loginRequirement,
        },
        appConf.assertPlatformOfName(account.platform),
        account.user.loginUsed,
        dispatch,
      );
      writeNewAccount(session, getAuthState(getState()).showOnboarding);
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

export const activateAccountAction =
  (platform: Platform, model: ActivationPayload) => async (dispatch: ThunkDispatch<any, any, any>, getState) => {
    try {
      await authService.activateAccount(platform, model);
      dispatch(
        loginCredentialsAction(
          {
            success: actions.login,
            requirement: actions.loginRequirement,
            activation: actions.redirectActivation,
            passwordRenew: actions.redirectPasswordRenew,
          },
          writeNewAccount,
          platform,
          {
            username: model.login,
            password: model.password,
          },
        ),
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
  };
}

export interface IChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export interface IChangePasswordUserInfo {
  login: string;
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
        if (payload[key as keyof IChangePasswordSubmitPayload]) formdata.append(key, payload[key]);
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
    } catch (e) {
      if ((e as IChangePasswordError).name === 'ECHANGEPWD') throw e;
      else throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
    }

    // 4 === Login back to get renewed token
    const credentials: AuthCredentials = {
      username: p.login,
      password: p.newPassword,
    };
    await dispatch(
      loginCredentialsAction(
        {
          success: actions.login,
          requirement: actions.loginRequirement,
          activation: actions.redirectActivation,
          passwordRenew: actions.redirectPasswordRenew,
        },
        writeNewAccount,
        platform,
        credentials,
      ),
    );
  };
}
