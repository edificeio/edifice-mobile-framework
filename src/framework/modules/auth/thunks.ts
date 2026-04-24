import DeviceInfo from 'react-native-device-info';
import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { audienceService } from '~/framework/modules/audience/service';
import { AudienceValidReactionTypes } from '~/framework/modules/audience/types';
import { appInfoActions } from '~/framework/modules/myapps/reducer/actions';
import { loadAppsDataFromService } from '~/framework/modules/myapps/reducer/adapter';
import { createMyAppsServiceWithTokenFetch } from '~/framework/modules/myapps/service';
import { checkAndShowSplashAds } from '~/framework/modules/splashads';
import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import firebaseService from '~/framework/util/notifications/service';
import { isTokenExpired, OAuth2Error, OAuth2ErrorCode, refreshTokenForAccount } from '~/framework/util/oauth2';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import { Storage } from '~/framework/util/storage';
import { Trackers } from '~/framework/util/tracker';
import { platformFetch } from '~/framework/util/transport';

import { callRegisteredActionsAtLogin } from './calls-at-login';
import {
  accountIsActive,
  IActivationPayload as ActivationPayload,
  AuthActiveAccount,
  AuthCredentials,
  AuthFederationCredentials,
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedAccount,
  AuthSavedLoggedInAccount,
  AuthSavedLoggedInAccountWithCredentials,
  createActivationError,
  createChangePasswordError,
  ForgotMode,
  getSerializedLoggedInAccountInfo,
  IActivationError,
  IChangePasswordError,
  IChangePasswordPayload,
  IForgotPayload,
  InitialAuthenticationMethod,
  PlatformAuthContext,
} from './model';
import { actions, ERASE_ALL_ACCOUNTS } from './redux/actions';
import { assertSession, getState as getAuthState, getSession } from './redux/reducer';
import { AuthState } from './redux/types';
import {
  assertNotPredeleted,
  fetchUserInfo,
  fetchUserPublicInfo,
  formatSession,
  getToken,
  IUserInfoBackend,
  revalidateTerms,
  UserPersonDataBackend,
  UserPrivateData,
} from './service';
import * as authService from './service';
import * as storage from './storage';
import { buildMyAppsOnboardingAccountKey, resetMyAppsOnboardingForAccount } from '../myapps/storage';

type AuthDispatch = ThunkDispatch<AuthState, any, Action>;

/**
 * Initialize Auth state by reading in the storage.
 * @returns If exist, returns the startup account to try refresh session with.
 */
export const authInitAction = () => async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
  // 1. read from storage and put in redux
  const startup = storage.readSavedStartup();
  const accounts = storage.readSavedAccounts();
  const showOnboarding = storage.readShowOnbording();
  const deviceId = await DeviceInfo.getUniqueId();
  dispatch(actions.authInit(startup, accounts, showOnboarding, deviceId));

  // 2. read from redux the startup account.
  const authState = getAuthState(getState());
  const ret =
    authState.pending && authState.pending.redirect === undefined && authState.pending.account
      ? authState.accounts[authState.pending.account]
      : Object.keys(authState.accounts).length === 1
        ? Object.values(authState.accounts)[0]
        : undefined;
  if (accountIsActive(ret)) {
    return getSerializedLoggedInAccountInfo(ret);
  } else return ret;
};

/**
 * fetch the auth context of given platform and stores it in redux.
 * @returns
 */
export const loadAuthContextAction = (platform: Platform) => async (dispatch: AuthDispatch) => {
  const context = await authService.platformConfig.context(platform);
  if (!context) return;
  dispatch(actions.loadPfContext(platform.name, context));
  return context;
};

/**
 * fetch the auth i18n keys of given platform and stores it in redux.
 * @returns
 */
export const loadPlatformLegalUrlsAction = (platform: Platform) => async (dispatch: AuthDispatch) => {
  const legalUrls = await authService.platformConfig.authI18n(platform);
  if (!legalUrls) return;
  dispatch(actions.loadPfLegalUrls(platform.name, legalUrls));
  return legalUrls;
};

/**
 * fetchs the valid reaction types of current platform and stores it in redux.
 * ToDo : Get this out of there ! This needs to be in the `audience` module and called with `callAtLogin`.
 * @returns
 */
export const loadValidReactionTypesAction = () => async (dispatch: AuthDispatch) => {
  const validReactionTypes = (await audienceService.reaction.getValidReactionTypes()) as AudienceValidReactionTypes;
  if (!validReactionTypes) return;
  dispatch(actions.loadPfValidReactionTypes(validReactionTypes));
  return validReactionTypes;
};

/**
 * Get default infos
 * - Fetch appropriate validation infos if must be verified
 * - Return default mobile or email
 */
async function getRequirementAdditionalInfos(
  requirement: AuthRequirement,
  tokens: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>,
) {
  let defaultMobile: string | undefined;
  let defaultEmail: string | undefined;
  if (requirement === AuthRequirement.MUST_VERIFY_MOBILE) {
    const mobileValidationInfos = await authService.mobileValidation.getValidationState(tokens);
    defaultMobile = mobileValidationInfos?.mobile;
  } else if (requirement === AuthRequirement.MUST_VERIFY_EMAIL) {
    const emailValidationInfos = await authService.emailValidation.getValidationState(tokens);
    defaultEmail = emailValidationInfos?.email;
  }
  return { defaultEmail, defaultMobile };
}

const withMeasure = <Fn extends (...args: any[]) => any>(fn: Fn, tag?: string) => {
  return (async (...args: any) => {
    const start = Date.now();
    try {
      const ret = fn(...args);
      if (ret instanceof Promise) return await ret;
      else return ret;
    } finally {
      console.debug(`[perf] ${tag ?? fn.toString()} in ${Date.now() - start}ms`);
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
   * Saves the new account information & registers tokens (fcm) into the backend
   * @param platform
   */
  finalizeSession: withErrorTracking(
    withMeasure(
      async (
        tokens: (AuthActiveAccount | AuthSavedLoggedInAccount)['tokens'],
        addTimestamp: number,
        logTimestamp: number,
        platform: Platform,
        loginUsed: string | undefined,
        userInfo: IUserInfoBackend,
        publicInfo: { userData?: UserPrivateData; userPublicInfo?: UserPersonDataBackend },
        method: InitialAuthenticationMethod | undefined,
      ) => {
        const { userData, userPublicInfo } = publicInfo;
        const sessionInfo = formatSession(
          tokens,
          addTimestamp,
          logTimestamp,
          platform,
          loginUsed,
          userInfo,
          method,
          userData,
          userPublicInfo,
        );
        await Storage.sessionInit(sessionInfo);
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
   * Get a new oAuth2 token set with given credentials
   * If bad credentials provided, check if this not the activation code / reset code
   */
  getNewToken: withErrorTracking(
    withMeasure(
      async (platform: Platform, credentials: AuthCredentials | AuthFederationCredentials) => getToken(platform, credentials),
      'getNewToken',
    ),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.getToken',
  ),

  /**
   * Get one of the requirements needed by the user to access the app
   * @param tokens
   * @returns
   */
  getRequirement: withErrorTracking(
    withMeasure(async (tokens: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) => {
      return authService.requirements.getNextNeeded(await authService.requirements.getState(tokens));
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
    withMeasure(async (tokens: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, requirement?: AuthRequirement) => {
      const infos = await fetchUserInfo(tokens);
      assertNotPredeleted(infos);
      // If we have requirements, we can't fetch public info, we mock it instead.
      const { userdata, userPublicInfo } = requirement
        ? { userdata: undefined, userPublicInfo: undefined }
        : await fetchUserPublicInfo(infos, tokens);

      return { infos, publicInfos: { userData: userdata, userPublicInfo } };
    }, 'getUserData'),
    'Auth',
    'LOGIN ERROR',
    'loginSteps.getUserData',
  ),
};

const requirementsThatNeedLegalUrls = [AuthRequirement.MUST_REVALIDATE_TERMS, AuthRequirement.MUST_VALIDATE_TERMS];

export function deactivateLoggedAccountActionIfApplicable(action?: Action | ThunkAction<void, IGlobalState, any, Action>) {
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    const account = getSession();
    if (account) {
      // Unregister the device token from the backend
      await firebaseService.disablePushNotificationsForAccount(account);
      // flush sessionReducers
      dispatch(createEndSessionAction());
      dispatch(actions.deactivate());
    }
    if (action) dispatch(action);
  };
}

interface AuthLoginFunctions {
  success:
    | typeof actions.addAccount
    | ((...args: Parameters<typeof actions.addAccount>) => ThunkAction<void, IGlobalState, undefined, Action>);
  requirement:
    | typeof actions.addAccountRequirement
    | ((...args: Parameters<typeof actions.addAccountRequirement>) => ThunkAction<void, IGlobalState, undefined, Action>);
  activation: typeof actions.redirectActivation;
  passwordRenew: typeof actions.redirectPasswordRenew;
  redirectCancel: typeof actions.redirectCancel | typeof actions.addAccountRedirectCancel;
  writeStorage: typeof storage.writeCreateAccount;
  getTimestamp: () => number;
}

const getLoginFunctions = {
  addAnotherAccount: (): AuthLoginFunctions => ({
    activation: actions.addAccountActivation,
    getTimestamp: Date.now,
    passwordRenew: actions.addAccountPasswordRenew,
    redirectCancel: actions.addAccountRedirectCancel,
    requirement:
      (...args: Parameters<typeof actions.addAccountRequirement>) =>
      async (dispatch: AuthDispatch) => {
        await dispatch(deactivateLoggedAccountActionIfApplicable(actions.addAccountRequirement(...args)));
      },
    success:
      (...args: Parameters<typeof actions.addAccount>) =>
      async (dispatch: AuthDispatch) => {
        await dispatch(deactivateLoggedAccountActionIfApplicable(actions.addAccount(...args)));
      },
    writeStorage: storage.writeCreateAccount,
  }),
  addFirstAccount: (): AuthLoginFunctions => ({
    activation: actions.redirectActivation,
    getTimestamp: Date.now,
    passwordRenew: actions.redirectPasswordRenew,
    redirectCancel: actions.redirectCancel,
    requirement: (...args: Parameters<typeof actions.addAccountRequirement>) =>
      actions.replaceAccountRequirement(ERASE_ALL_ACCOUNTS, ...args),
    success: (...args: Parameters<typeof actions.addAccount>) => actions.replaceAccount(ERASE_ALL_ACCOUNTS, ...args),
    writeStorage: (...args: Parameters<typeof storage.writeCreateAccount>) =>
      storage.writeReplaceAccount(ERASE_ALL_ACCOUNTS, ...args),
  }),
  replaceAccount: (id: keyof AuthState['accounts'], timestamp: number): AuthLoginFunctions => ({
    activation: actions.redirectActivation,
    getTimestamp: () => timestamp,
    passwordRenew: (...[platformName, login, code]: Parameters<typeof actions.redirectPasswordRenew>) =>
      actions.redirectPasswordRenew(platformName, login, code, id, timestamp),
    redirectCancel: actions.redirectCancel,
    requirement: (...args: Parameters<typeof actions.addAccountRequirement>) => actions.replaceAccountRequirement(id, ...args),
    success: (...args: Parameters<typeof actions.addAccount>) => actions.replaceAccount(id, ...args),
    writeStorage: (...args: Parameters<typeof storage.writeCreateAccount>) => storage.writeReplaceAccount(id, ...args),
  }),
  restoreAccount: (id: keyof AuthState['accounts'], timestamp: number): AuthLoginFunctions => ({
    activation: actions.redirectActivation,
    getTimestamp: () => timestamp,
    passwordRenew: actions.redirectPasswordRenew,
    redirectCancel: actions.redirectCancel,
    requirement: (...args: Parameters<typeof actions.addAccountRequirement>) => actions.replaceAccountRequirement(id, ...args),
    success: (...args: Parameters<typeof actions.addAccount>) => actions.replaceAccount(id, ...args),
    writeStorage: (...args: Parameters<typeof storage.writeCreateAccount>) => storage.writeReplaceAccount(id, ...args),
  }),
  switchAccount: (id: keyof AuthState['accounts'], timestamp: number): AuthLoginFunctions => ({
    activation: actions.redirectActivation,
    getTimestamp: () => timestamp,
    passwordRenew: actions.redirectPasswordRenew,
    redirectCancel: actions.redirectCancel,
    requirement:
      (...args: Parameters<typeof actions.addAccountRequirement>) =>
      async (dispatch: AuthDispatch) => {
        await dispatch(deactivateLoggedAccountActionIfApplicable(actions.replaceAccountRequirement(id, ...args)));
      },
    success:
      (...args: Parameters<typeof actions.addAccount>) =>
      async (dispatch: AuthDispatch) => {
        await dispatch(deactivateLoggedAccountActionIfApplicable(actions.replaceAccount(id, ...args)));
      },
    writeStorage: (...args: Parameters<typeof storage.writeCreateAccount>) => storage.writeReplaceAccount(id, ...args),
  }),
};

/**
 * Load MyApps data during login & enrich with module info.
 * This ensures that if loading apps fails, the login will fail too.
 * Apps are enriched at this point since accountInfo contains the session rights.
 */
const loadMyAppsAtLogin = async (accountInfo: AuthActiveAccount, dispatch: AuthDispatch) => {
  try {
    const myAppsServiceWithTokens = createMyAppsServiceWithTokenFetch(accountInfo.tokens);
    const payload = await loadAppsDataFromService(myAppsServiceWithTokens, accountInfo);
    dispatch(appInfoActions.fetchSuccess(payload));
  } catch (error) {
    throw error;
  }
};

/** Generic function that perform login task when token got. Only affects Redux, not storage ! */
const performLogin = async (
  tokens: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>,
  reduxActions: Pick<AuthLoginFunctions, 'success' | 'requirement' | 'getTimestamp'>,
  platform: Platform,
  loginUsed: string | undefined,
  method: InitialAuthenticationMethod | undefined,
  dispatch: AuthDispatch,
) => {
  const requirement = await loginSteps.getRequirement(tokens);
  const user = await loginSteps.getUserData(tokens, requirement);

  const accountInfo = await loginSteps.finalizeSession(
    tokens.tokens,
    reduxActions.getTimestamp(),
    reduxActions.getTimestamp(),
    platform,
    loginUsed,
    user.infos,
    user.publicInfos,
    method,
  );

  if (requirement) {
    const context = await authService.platformConfig.context(platform);
    const infos = await getRequirementAdditionalInfos(requirement, tokens);
    accountInfo.user.mobile = infos.defaultMobile;
    accountInfo.user.email = infos.defaultEmail;
    if (requirementsThatNeedLegalUrls.includes(requirement)) {
      await dispatch(loadPlatformLegalUrlsAction(platform));
    }
    await dispatch(deactivateLoggedAccountActionIfApplicable(reduxActions.requirement(accountInfo, requirement, context)));
    return accountInfo;
  } else {
    await dispatch(deactivateLoggedAccountActionIfApplicable(reduxActions.success(accountInfo)));
  }
  await loadMyAppsAtLogin(accountInfo, dispatch);

  // Setup push-notifications for the new account
  // No `await` as it is non-blocking for login process
  firebaseService.enablePushNotificationsForAccount(accountInfo);

  // Call registered callbacks at login
  callRegisteredActionsAtLogin();

  // GET the audience valid reaction types for the platform
  dispatch(loadValidReactionTypesAction());

  // Refresh oneSessionId token
  await dispatch(refreshSessionIdForAccountAction(accountInfo));

  return accountInfo;
};

/** Generic thunk action that handle everything for a login with credentials */
const loginCredentialsAction =
  (functions: AuthLoginFunctions, platform: Platform, credentials: AuthCredentials, key?: number) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      // Nested try/catch block to handle CREDENTIALS_MISMATCH errors caused by activation/renew code use.
      try {
        const tokens = await loginSteps.getNewToken(platform, credentials);
        const session = await performLogin(
          { tokens },
          functions,
          platform,
          credentials.username,
          InitialAuthenticationMethod.LOGIN_PASSWORD,
          dispatch,
        );
        functions.writeStorage(session, getAuthState(getState()).showOnboarding);
        return session;
      } catch (ee) {
        console.error('loginCredentialsAction', JSON.stringify(ee));
        if (
          Error.findCause(
            ee,
            (error): error is OAuth2Error => error instanceof OAuth2Error && error.code === OAuth2ErrorCode.ACTIVATION_CODE,
          )
        ) {
          dispatch(functions.activation(platform.name, credentials.username, credentials.password));
          return AuthPendingRedirection.ACTIVATE;
        } else if (
          Error.findCause(
            ee,
            (error): error is OAuth2Error => error instanceof OAuth2Error && error.code === OAuth2ErrorCode.PASSWORD_RESET,
          )
        ) {
          dispatch(functions.passwordRenew(platform.name, credentials.username, credentials.password));
          return AuthPendingRedirection.RENEW_PASSWORD;
        } else {
          throw ee;
        }
      }
    } catch (e) {
      console.error(`[Auth] Login credentials error :`, e);
      dispatch(
        actions.authError({
          info: e as Error,
          key,
        }),
      );
      throw e;
    }
  };

/**
 * Manual login action with credentials by getting a fresh new token.
 * New account will exist among the other ones.
 * @param platform platform info to create the session on.
 * @param credentials login & password
 * @param key the screen key to store eventuel errors with
 * @returns
 * @throws
 */
export const loginCredentialsActionAddFirstAccount = (platform: Platform, credentials: AuthCredentials, key?: number) =>
  loginCredentialsAction(getLoginFunctions.addFirstAccount(), platform, credentials, key);

/**
 * Manual login action with credentials by getting a fresh new token.
 * New account will replace the one with given id.
 * @param accountId the account to replace
 * @param platform platform info to create the session on.
 * @param credentials login & password
 * @param key the screen key to store eventuel errors with
 * @returns
 * @throws
 */
export const loginCredentialsActionReplaceAccount = (
  accountId: keyof AuthState['accounts'],
  timestamp: number,
  platform: Platform,
  credentials: AuthCredentials,
  key?: number,
) => loginCredentialsAction(getLoginFunctions.replaceAccount(accountId, timestamp), platform, credentials, key);

export const loginCredentialsActionAddAnotherAccount = (platform: Platform, credentials: AuthCredentials, key?: number) =>
  loginCredentialsAction(getLoginFunctions.addAnotherAccount(), platform, credentials, key);

/**
 * Manual login action with Federation.
 * @param platform platform info to create the session on.
 * @param saml saml assertion
 * @returns
 * @throws
 */
const loginFederationAction =
  (functions: AuthLoginFunctions, platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      const tokens = await loginSteps.getNewToken(platform, credentials);
      const session = await performLogin(
        { tokens },
        functions,
        platform,
        undefined,
        InitialAuthenticationMethod.WAYF_SAML,
        dispatch,
      );
      functions.writeStorage(session, getAuthState(getState()).showOnboarding);
      return session;
    } catch (e) {
      // When login in with federation, "CREDENTIALS_MISMATCH" is the errcode obtained if the saml token does not link to an actual user account.
      // We override the error type to "SAML_INVALID" in this case.
      const error =
        e instanceof OAuth2Error && e.code === OAuth2ErrorCode.CREDENTIALS_MISMATCH
          ? new OAuth2Error(OAuth2ErrorCode.SAML_INVALID, undefined, { cause: e.cause })
          : e;

      console.error(`[Auth] Login federation error :`, error);
      dispatch(
        actions.authError({
          info: error as Error,
          key,
        }),
      );
      throw error;
    }
  };

export const loginFederationActionAddFirstAccount = (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  loginFederationAction(getLoginFunctions.addFirstAccount(), platform, credentials, key);

export const loginFederationActionReplaceAccount = (
  accountId: keyof AuthState['accounts'],
  timestamp: number,
  platform: Platform,
  credentials: AuthFederationCredentials,
  key?: number,
) => loginFederationAction(getLoginFunctions.replaceAccount(accountId, timestamp), platform, credentials, key);

export const loginFederationActionAddAnotherAccount = (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
  loginFederationAction(getLoginFunctions.addAnotherAccount(), platform, credentials, key);

/**
 * Automatic login action with given saved account information (and its serialized token).
 * @param account stored accound information
 * @returns
 * @throws
 */
const loadAccountAction =
  (functions: AuthLoginFunctions, account: AuthSavedLoggedInAccount | AuthActiveAccount) =>
  async (dispatch: AuthDispatch, getState: () => IGlobalState) => {
    try {
      const accountToRestore = accountIsActive(account)
        ? (getSerializedLoggedInAccountInfo(account) as AuthSavedLoggedInAccount)
        : account;
      await refreshTokenForAccount(accountToRestore);
      appConf.assertPlatformOfName(accountToRestore.platform);
      const session = await performLogin(
        accountToRestore,
        functions,
        appConf.assertPlatformOfName(accountToRestore.platform),
        (accountToRestore.user as Partial<AuthSavedLoggedInAccountWithCredentials['user']>).loginUsed,
        account.method,
        dispatch,
      );
      storage.writeReplaceAccount(accountToRestore.user.id, session, getAuthState(getState()).showOnboarding);
      return session;
    } catch (e) {
      console.error(`[Auth] Restore error :`, e);
      dispatch(
        actions.authError({
          info: e as Error,
          key: undefined,
        }),
      );
      throw e;
    }
  };

export const restoreAccountAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) =>
  loadAccountAction(getLoginFunctions.restoreAccount(account.user.id, account.addTimestamp), account);

export const switchAccountAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) =>
  loadAccountAction(getLoginFunctions.switchAccount(account.user.id, account.addTimestamp), account);

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
  const requirement = await loginSteps.getRequirement(session);
  const user = await loginSteps.getUserData(session, requirement);
  const accountInfo = formatSession(
    session.tokens,
    session.addTimestamp,
    session.logTimestamp,
    session.platform,
    (session.user as Partial<AuthSavedLoggedInAccountWithCredentials['user']>).loginUsed,
    user.infos,
    session.method,
    user.publicInfos.userData,
    user.publicInfos.userPublicInfo,
  );
  let context: PlatformAuthContext | undefined;
  if (requirement) {
    context = await authService.platformConfig.context(session.platform);
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

const activateAccountAction =
  (reduxActions: AuthLoginFunctions, platform: Platform, model: ActivationPayload) =>
  async (dispatch: ThunkDispatch<any, any, any>) => {
    let activationWasDone = false;
    try {
      await authService.activateAccount(platform, model);
      activationWasDone = true;
      await dispatch(
        loginCredentialsAction(reduxActions, platform, {
          password: model.password,
          username: model.login,
        }),
      );
    } catch (e) {
      if (activationWasDone) {
        dispatch(reduxActions.redirectCancel(platform.name, model.login));
      }

      if ((e as IActivationError).name === 'EACTIVATION') throw e;
      else if (e instanceof global.Error) throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e);
      else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '');
    }
  };

export const activateAccountActionAddFirstAccount = (platform: Platform, model: ActivationPayload) =>
  activateAccountAction(getLoginFunctions.addFirstAccount(), platform, model);

export const activateAccountActionAddAnotherAccount = (platform: Platform, model: ActivationPayload) =>
  activateAccountAction(getLoginFunctions.addAnotherAccount(), platform, model);

/**
 * Send reset mail for id or password
 * @param platform
 * @param userInfo
 * @param forgotMode
 * @returns
 */
export function forgotAction(platform: Platform, userInfo: IForgotPayload, forgotMode: ForgotMode) {
  return async () => {
    if (forgotMode === 'id') {
      return authService.forgot<'id'>(platform, forgotMode, {
        firstName: userInfo.firstName,
        mail: userInfo.login,
        structureId: userInfo.structureId,
      });
    } else {
      return authService.forgot<'password'>(platform, forgotMode, {
        login: userInfo.login,
      });
    }
  };
}

/** Action that erases the session without Tracking anything. */
export function logoutAction() {
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    // Unregister the device token from the backend
    const account = assertSession();
    await firebaseService.disablePushNotificationsForAccount(account);
    // Writes new storage values
    storage.writeLogout(account);
    // Validate log out
    dispatch(actions.logout());
    dispatch(createEndSessionAction()); // flush sessionReducers
  };
}

export function removeAccountAction(account: AuthActiveAccount | AuthSavedAccount) {
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    if (accountIsActive(account)) {
      await dispatch(logoutAction());
    }
    const platformName = accountIsActive(account) ? account.platform.name : account.platform;
    resetMyAppsOnboardingForAccount(buildMyAppsOnboardingAccountKey(platformName, account.user.id));
    dispatch(actions.removeAccount(account.user.id));
    storage.writeDeleteAccount(account.user.id);
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

function changePasswordAction(
  reduxActions: AuthLoginFunctions,
  platform: Platform,
  p: IChangePasswordPayload,
  forceChange?: boolean,
  _rememberMe?: boolean,
) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      // === 2 - prepare chg pwd payload
      const payload: IChangePasswordSubmitPayload = {
        ...('oldPassword' in p ? { oldPassword: p.oldPassword } : {}),
        ...('resetCode' in p ? { resetCode: p.resetCode } : {}),
        callback: '',
        confirmPassword: p.confirm,
        login: p.login,
        password: p.newPassword,
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
      const res = await platformFetch(platform, `/auth/reset`, {
        body: formdata,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
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
      else
        throw createChangePasswordError(
          'change password',
          I18n.get('auth-changepassword-error-submit'),
          undefined,
          e instanceof global.Error ? e : undefined,
        );
    }

    try {
      // 4 === Login back to get renewed token
      const credentials: AuthCredentials = {
        password: p.newPassword,
        username: p.login,
      };
      await dispatch(loginCredentialsAction(reduxActions, platform, credentials));
    } catch (e) {
      dispatch(reduxActions.redirectCancel(platform.name, p.login));
      throw e;
    }
  };
}

export const changePasswordActionAddFirstAccount = (
  platform: Platform,
  p: IChangePasswordPayload,
  forceChange?: boolean,
  rememberMe?: boolean,
) => changePasswordAction(getLoginFunctions.addFirstAccount(), platform, p, forceChange, rememberMe);

export const changePasswordActionReplaceAccount = (
  accountId: keyof AuthState['accounts'],
  timestamp: number,
  platform: Platform,
  p: IChangePasswordPayload,
  forceChange?: boolean,
  rememberMe?: boolean,
) => changePasswordAction(getLoginFunctions.replaceAccount(accountId, timestamp), platform, p, forceChange, rememberMe);

export const buildChangePasswordActionReplaceAccount =
  (accountId: keyof AuthState['accounts'], timestamp: number) =>
  (platform: Platform, p: IChangePasswordPayload, forceChange?: boolean, rememberMe?: boolean) =>
    changePasswordAction(getLoginFunctions.replaceAccount(accountId, timestamp), platform, p, forceChange, rememberMe);

export const buildLoginFederationActionReplaceAccount =
  (accountId: keyof AuthState['accounts'], timestamp: number) =>
  (platform: Platform, credentials: AuthFederationCredentials, key?: number) =>
    loginFederationAction(getLoginFunctions.replaceAccount(accountId, timestamp), platform, credentials, key);

export const changePasswordActionAddAnotherAccount = (
  platform: Platform,
  p: IChangePasswordPayload,
  forceChange?: boolean,
  rememberMe?: boolean,
) => changePasswordAction(getLoginFunctions.addAnotherAccount(), platform, p, forceChange, rememberMe);

export const refreshSessionIdForAccountAction =
  (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async (dispatch: ThunkDispatch<any, any, any>) => {
    const newSessionId = await authService.getOneSessionId(account);
    dispatch(actions.setOneSessionId(account.user.id, newSessionId));
    return newSessionId;
  };

export const refreshQueryParamTokenAction =
  (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async (dispatch: ThunkDispatch<any, any, any>) => {
    if (account.tokens.queryParam && !isTokenExpired(account.tokens.queryParam)) {
      return account.tokens.queryParam;
    }
    const newToken = await authService.getQueryParamToken(account);
    dispatch(actions.setQueryParamToken(account.user.id, newToken));
    return newToken;
  };
