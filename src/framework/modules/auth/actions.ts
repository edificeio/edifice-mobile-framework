import CookieManager from '@react-native-cookies/cookies';
import DeviceInfo from 'react-native-device-info';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { Platform } from '~/framework/util/appConf';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import { Trackers } from '~/framework/util/tracker';
import { clearRequestsCache } from '~/infra/fetchWithCache';
import { OAuth2ErrorCode, destroyOAuth2, uniqueId, urlSigner } from '~/infra/oauth';

import {
  AuthError,
  ForgotMode,
  IActivationError,
  IActivationPayload,
  IAuthContext,
  IAuthCredentials,
  IChangePasswordError,
  IChangePasswordPayload,
  IForgotPayload,
  LegalUrls,
  PartialSessionScenario,
  RuntimeAuthErrorCode,
  SessionType,
  createActivationError,
  createAuthError,
  createChangePasswordError,
} from './model';
import { assertSession, actions as authActions, getSession } from './reducer';
import {
  IUserInfoBackend,
  UserPersonDataBackend,
  UserPrivateData,
  createSession,
  ensureCredentialsMatchActivationCode,
  ensureUserValidity,
  fetchUserInfo,
  fetchUserPublicInfo,
  fetchUserRequirements,
  forgetPreviousSession,
  formatSession,
  getAuthContext,
  getAuthTranslationKeys,
  getEmailValidationInfos,
  getMobileValidationInfos,
  getPartialSessionScenario,
  manageFirebaseToken as initFirebaseToken,
  removeFirebaseToken,
  restoreSession,
  restoreSessionAvailable,
  savePlatform,
  saveSession,
} from './service';

interface ILoginActionResultActivation {
  action: 'activate';
  credentials: IAuthCredentials;
  rememberMe?: boolean;
  context: IAuthContext;
}
interface ILoginActionResultPartialScenario {
  action: PartialSessionScenario;
  defaultMobile?: string;
  defaultEmail?: string;
  credentials?: IAuthCredentials;
  rememberMe?: boolean;
  context: IAuthContext;
}
export type ILoginResult = ILoginActionResultActivation | ILoginActionResultPartialScenario | void;

/**
 *
 * @param platform
 * @returns
 */
export function getLegalUrlsAction(platform: Platform) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any): Promise<LegalUrls | undefined> {
    // === 1: Load legal document urls
    try {
      const authTranslationKeys = await getAuthTranslationKeys(platform, I18n.getLanguage());
      const legalUrls: LegalUrls = {
        cgu: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-cgu'), platform),
        personalDataProtection: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-personaldataprotection'), platform),
        cookies: urlSigner.getAbsoluteUrl(I18n.get('user-legalurl-cookies'), platform),
      };
      if (authTranslationKeys) {
        legalUrls.userCharter = urlSigner.getAbsoluteUrl(
          authTranslationKeys['auth.charter'] || I18n.get('user-legalurl-usercharter'),
          platform,
        );
      }
      dispatch(authActions.getLegalDocuments(legalUrls));
      return legalUrls;
    } catch (e) {
      const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
      if (authError?.type === RuntimeAuthErrorCode.LOAD_I18N_ERROR) {
        // Do nothing, this kind of error is non-blocking
      } else {
        throw e;
      }
    }
  };
}

/**
 * Get default infos
 * - Fetch appropriate validation infos if must be verified
 * - Return default mobile or email
 */
async function getDefaultInfos(partialSessionScenario: PartialSessionScenario, platformUrl: string) {
  let defaultMobile: string | undefined;
  let defaultEmail: string | undefined;
  if (partialSessionScenario === PartialSessionScenario.MUST_VERIFY_MOBILE) {
    const mobileValidationInfos = await getMobileValidationInfos(platformUrl);
    defaultMobile = mobileValidationInfos?.mobile;
  } else if (partialSessionScenario === PartialSessionScenario.MUST_VERIFY_EMAIL) {
    const emailValidationInfos = await getEmailValidationInfos();
    defaultEmail = emailValidationInfos?.email;
  }
  return { defaultMobile, defaultEmail };
}

/**
 * Get token
 * - Create new session and token if credentials are provided
 * - Otherwise restore an existing session and token
 * - Throw appropiate error if needed (if bad credentials, verify if it's an account activation process)
 */
function getTokenAction(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any) {
    try {
      if (credentials) {
        await createSession(platform, credentials);
      } else {
        const tokenData = await restoreSessionAvailable();
        if (tokenData) {
          await restoreSession(platform);
        } else throw createAuthError(RuntimeAuthErrorCode.NO_TOKEN, 'No stored token', '');
      }
    } catch (e) {
      const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getToken');
      if (credentials && authError?.type === OAuth2ErrorCode.BAD_CREDENTIALS) {
        // ensureCredentialsMatchActivationCode is awaited before the two other because it throws auth errors
        await ensureCredentialsMatchActivationCode(platform, credentials);
        const [context] = await Promise.all([getAuthContext(platform), dispatch(getLegalUrlsAction(platform))]);
        return { action: 'activate', context, credentials, rememberMe } as ILoginActionResultActivation;
      }
      throw e;
    }
  };
}

/**
 * Get user data
 * - Fetch user infos & verify data validity (no pending deletion, etc.)
 * - Add unique device id
 * - Fetch user public infos
 * - Track & throw appropiate error if needed
 */
async function getUserData(platform: Platform, partialSessionScenario?: PartialSessionScenario) {
  try {
    const infos = await fetchUserInfo(platform);
    ensureUserValidity(infos);
    DeviceInfo.getUniqueId().then(uniqueID => {
      infos.uniqueId = uniqueID;
    });
    // If we have requirements (=partialSessionScenario), we can't fetch public info, we mock it instead.
    const { userdata, userPublicInfo } = partialSessionScenario
      ? { userdata: undefined, userPublicInfo: undefined }
      : await fetchUserPublicInfo(infos, platform);
    return { infos, publicInfos: { userData: userdata, userPublicInfo } };
  } catch (e) {
    Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getUserData');
    throw e;
  }
}

/**
 * Handle session
 * - Initialize firebase token
 * - Save selected platform
 * - Forget previous session
 * - Save session if needed
 * - Track & throw appropiate error if needed
 */
async function handleSession(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
  try {
    await Promise.all([initFirebaseToken(platform), savePlatform(platform), forgetPreviousSession()]);
    const mustSaveSession = !credentials || rememberMe || platform.wayf;
    if (mustSaveSession) await saveSession();
    return mustSaveSession;
  } catch (e) {
    Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'handleSession');
    throw e;
  }
}

/**
 * Get user conditions
 * - Fetch legal url's
 * - Fetch user requirements
 * - Return partial session scenario if needed (terms validation, mobile verification, etc.)
 * - Track & throw appropiate error if needed
 */
async function getUserConditions(platform: Platform, dispatch: ThunkDispatch<any, any, any>) {
  try {
    const [userRequirements] = await Promise.all([fetchUserRequirements(platform), dispatch(getLegalUrlsAction(platform))]);
    const partialSessionScenario = getPartialSessionScenario(userRequirements);
    return partialSessionScenario;
  } catch (e) {
    Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'getUserConditions');
    throw e;
  }
}

/**
 * Handle login redirection
 * - Fetch default data (email or mobile validation infos) and auth context in case of partial session scenario
 * - Dispatch and return login redirection infos
 * - Track & throw appropiate error if needed
 */
function handleLoginRedirection(
  platform: Platform,
  userInfo: IUserInfoBackend,
  publicInfo: { userData?: UserPrivateData; userPublicInfo?: UserPersonDataBackend },
  mustSaveSession?: string | boolean,
  partialSessionScenario?: PartialSessionScenario,
  credentials?: IAuthCredentials,
  rememberMe?: boolean,
) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any) {
    try {
      const { userData, userPublicInfo } = publicInfo;
      const sessionInfo = formatSession(platform, userInfo, userData, userPublicInfo, !!mustSaveSession);
      if (partialSessionScenario) {
        const { defaultMobile, defaultEmail } = await getDefaultInfos(partialSessionScenario, platform.url);
        const context = await getAuthContext(platform);
        dispatch(authActions.sessionPartial(sessionInfo));
        return { action: partialSessionScenario, defaultEmail, defaultMobile, context, credentials, rememberMe };
      } else {
        dispatch(authActions.sessionCreate(sessionInfo));
      }
    } catch (e) {
      Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'handleLoginRedirection');
      throw e;
    }
  };
}

/**
 * Track login
 * - Track login completion (including login type and partial session scenario)
 * - Track & throw appropiate error if needed
 */
async function trackLogin(credentials?: IAuthCredentials, partialSessionScenario?: PartialSessionScenario) {
  try {
    await Trackers.trackEvent('Auth', credentials ? 'LOGIN' : 'RESTORE', partialSessionScenario);
  } catch (e) {
    Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', 'trackLogin');
    throw e;
  }
}

export function loginAction(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
  return async function (dispatch: ThunkDispatch<any, any, any>): Promise<ILoginResult> {
    try {
      // 1. Get token from session (created/restored)
      // (exit loginAction and redirect to activation if needed)
      const activationScenario = await dispatch(getTokenAction(platform, credentials, rememberMe));
      if (activationScenario) return activationScenario;

      // 2. Get user conditions (legal urls, requirements)
      const partialSessionScenario = await getUserConditions(platform, dispatch);

      // 3. Get user data (personal infos, validity, device id, public infos)
      const user = await getUserData(platform, partialSessionScenario);

      // 4. Handle session (firebase, platform, save)
      const mustSaveSession = await handleSession(platform, credentials, rememberMe);

      // 5. Handle login redirection (partial/complete)
      const redirectScenario = await dispatch(
        handleLoginRedirection(
          platform,
          user.infos,
          user.publicInfos,
          mustSaveSession,
          partialSessionScenario,
          credentials,
          rememberMe,
        ),
      );

      // 6. Track login (initial/restored)
      await trackLogin(credentials, partialSessionScenario);

      return redirectScenario;
    } catch (e) {
      const authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;
      // Don't show error message if no stored token is found
      if (authError?.type === RuntimeAuthErrorCode.NO_TOKEN) return undefined;
      await Trackers.trackEvent('Auth', 'LOGIN ERROR', authError?.type);
      dispatch(authActions.sessionError(authError?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
      throw e;
    }
  };
}

interface IActivationSubmitPayload extends IActivationPayload {
  callBack: string;
  theme: string;
}

// ToDo : move following API calls to a service
export function activateAccountAction(platform: Platform, model: IActivationPayload, rememberMe?: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState) => {
    try {
      // === 0 auto select the default theme
      const theme = platform.webTheme;
      if (!theme && __DEV__) console.debug('[User][Activation] activationAccount -> theme was not found:', platform.webTheme);
      // === 1 - prepare payload
      const payload: IActivationSubmitPayload = {
        acceptCGU: true,
        activationCode: model.activationCode,
        callBack: '',
        login: model.login,
        password: model.password,
        confirmPassword: model.confirmPassword,
        mail: model.mail || '',
        phone: model.phone,
        theme,
      };
      const formdata = new FormData();
      for (const key in payload) {
        formdata.append(key, payload[key]);
      }
      // === 2 - Send activation information
      const res = await fetch(`${platform.url}/auth/activation/no-login`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-Device-Id': uniqueId(),
        },
        method: 'post',
      });
      // === 3 - Check whether the activation was successful
      if (!res.ok) {
        throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'));
      }
      // a json response can contains an error field
      if (res.headers.get('content-type')?.indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          throw createActivationError('activation', resBody.error.message);
        }
      }

      // === Bonus : clear cookies. The backend sends back a Set-Cookie header that conflicts with the oAuth2 token.
      await CookieManager.clearAll();
      // ToDo : what to do if clearing the cookies doesn't work ? The user will be stuck with that cookie and will be logged to that account forever and ever ! 😱

      // === 4 - call thunk login using login/password
      const redirect = await dispatch(
        loginAction(
          platform,
          {
            username: model.login,
            password: model.password,
          },
          rememberMe,
        ),
      );
      // === 5 - Tracking
      Trackers.trackEvent('Auth', 'ACTIVATE');
      return redirect;
    } catch (e) {
      if ((e as IActivationError).name === 'EACTIVATION') throw e;
      else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e as object);
    }
  };
}

/**
 * Send reset mail for id or password
 * @param platform
 * @param userInfo
 * @param forgotMode
 * @returns
 * ToDo : type the return value
 */
export function forgotAction(platform: Platform, userInfo: IForgotPayload, forgotMode: ForgotMode) {
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    const payLoad =
      forgotMode === 'id'
        ? {
            mail: userInfo.login,
            firstName: userInfo.firstName,
            structureId: userInfo.structureId,
            service: 'mail',
          }
        : {
            login: userInfo.login,
            service: 'mail',
          };
    const api = `${platform.url}/auth/forgot-${forgotMode === 'id' ? 'id' : 'password'}`;
    const res = await fetch(api, {
      body: JSON.stringify(payLoad),
      method: 'POST',
      headers: {
        'X-Device-Id': uniqueId(),
        'Content-Type': 'application/json',
      },
    });
    const resStatus = res.status;
    const resJson = await res.json();
    const ok = resStatus >= 200 && resStatus < 300;
    const response = { ...resJson, ok };
    return response;
  };
}

/**
 * Removes the currently stored auth error
 */
export function consumeAuthError() {
  return (dispatch: ThunkDispatch<any, any, any>) => {
    dispatch(authActions.sessionErrorConsume());
  };
}

/** Action that erases the session without Tracking anything. */
function sessionDestroyAction(platform: Platform) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // Unregister the device token from the backend
    await removeFirebaseToken(platform);
    // Erase requests cache
    await clearRequestsCache();
    // Erase stored oauth2 token and cache information
    await destroyOAuth2();
    // Validate log out
    dispatch(authActions.sessionEnd());
    dispatch(createEndSessionAction()); // flush sessionReducers
  };
}

/** Action that invalidates the session without Tracking anything in case of error.
 * This removes FCM and takes the user to the auth stack.
 */
export function sessionInvalidateAction(platform: Platform, error?: AuthError) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // Unregister the device token from the backend
    await removeFirebaseToken(platform);
    // Validate log out
    dispatch(authActions.sessionError(error?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
    dispatch(createEndSessionAction()); // flush sessionReducers
  };
}

/** Clear the current session and track logout event.
 * Session must exist and this action will throw if no session is active.
 */
export function logoutAction() {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const platform = assertSession().platform;
    await dispatch(sessionDestroyAction(platform));
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
      const res = await fetch(`${platform.url}/auth/reset`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-Device-Id': uniqueId(),
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
    const rememberMe = getSession()?.type === SessionType.PERMANENT;
    const redirect = await dispatch(loginAction(platform, credentials, rememberMe));
    return redirect;
  };
}
