import CookieManager from '@react-native-cookies/cookies';
import I18n from 'i18n-js';
import DeviceInfo from 'react-native-device-info';
import { ThunkDispatch } from 'redux-thunk';

import { SupportedLocales } from '~/app/i18n';
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
  createActivationError,
  createChangePasswordError,
} from './model';
import { assertSession, actions as authActions } from './reducer';
import {
  createSession,
  ensureCredentialsMatchActivationCode,
  ensureUserValidity,
  fetchUserInfo,
  fetchUserPublicInfo,
  fetchUserRequirements,
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
function getLegalUrlsAction(platform: Platform) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any): Promise<LegalUrls | undefined> {
    // === 1: Load legal document urls
    try {
      const legalUrls: LegalUrls = {
        cgu: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.cgu'), platform),
        personalDataProtection: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.personalDataProtection'), platform),
        cookies: urlSigner.getAbsoluteUrl(I18n.t('user.legalUrl.cookies'), platform),
      };
      const authTranslationKeys = await getAuthTranslationKeys(platform, I18n.locale as SupportedLocales);
      if (authTranslationKeys) {
        legalUrls.userCharter = urlSigner.getAbsoluteUrl(
          authTranslationKeys['auth.charter'] || I18n.t('user.legalUrl.userCharter'),
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
 *
 * @param partialSessionScenario
 * @returns
 */
async function getDefaultInfos(partialSessionScenario: PartialSessionScenario) {
  let defaultMobile: string | undefined;
  let defaultEmail: string | undefined;
  if (partialSessionScenario === PartialSessionScenario.MUST_VERIFY_MOBILE) {
    const mobileValidationInfos = await getMobileValidationInfos();
    defaultMobile = mobileValidationInfos?.mobile;
  } else if (partialSessionScenario === PartialSessionScenario.MUST_VERIFY_EMAIL) {
    const emailValidationInfos = await getEmailValidationInfos();
    defaultEmail = emailValidationInfos?.email;
  }
  return { defaultMobile, defaultEmail };
}

export function loginAction(platform: Platform, credentials?: IAuthCredentials, rememberMe?: boolean) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => any): Promise<ILoginResult> {
    try {
      await dispatch(getLegalUrlsAction(platform));

      // 1. Get token from somewhere
      if (credentials) {
        await createSession(platform, credentials);
      } else {
        const tokenData = await restoreSessionAvailable();
        if (tokenData) {
          await restoreSession(platform);
        } else {
          return;
        }
      }

      // 2. Gather user information
      const userinfo = await fetchUserInfo(platform);
      ensureUserValidity(userinfo);
      // Add device ID to userinfo
      DeviceInfo.getUniqueId().then(uniqueID => {
        userinfo.uniqueId = uniqueID;
      });

      // 3. Gather user requirements
      const userRequirements = await fetchUserRequirements(platform);

      // 4. Gather partial session case
      const partialSessionScenario = getPartialSessionScenario(userRequirements);

      // 5. Gather user public info (only if complete session scenario)
      const { userdata, userPublicInfo } = partialSessionScenario
        ? { userdata: undefined, userPublicInfo: undefined }
        : await fetchUserPublicInfo(userinfo, platform);

      // 6. Init Firebase
      await initFirebaseToken(platform);

      // 7. Save session info if needed
      await savePlatform(platform);
      if (!credentials || rememberMe || platform.wayf) await saveSession();

      // 8. Do tracking
      if (credentials) await Trackers.trackEvent('Auth', 'LOGIN', partialSessionScenario);
      else await Trackers.trackEvent('Auth', 'RESTORE', partialSessionScenario);

      // === Bonus : clear cookies. The backend can soemtimes send back a Set-Cookie header that conflicts with the oAuth2 token.
      await CookieManager.clearAll();

      // 9. Validate session + return redirect scenario
      const sessionInfo = formatSession(platform, userinfo, userdata, userPublicInfo);
      if (partialSessionScenario) {
        const { defaultMobile, defaultEmail } = await getDefaultInfos(partialSessionScenario);
        const context = await getAuthContext(platform);
        dispatch(authActions.sessionPartial(sessionInfo));
        return { action: partialSessionScenario, defaultEmail, defaultMobile, context, credentials, rememberMe };
      } else {
        dispatch(authActions.sessionCreate(sessionInfo));
      }
    } catch (e) {
      let authError = (e as Error).name === 'EAUTH' ? (e as AuthError) : undefined;

      // 1. If error is bad user/password, it may be an account activation process
      if (credentials && authError?.type === OAuth2ErrorCode.BAD_CREDENTIALS) {
        try {
          await ensureCredentialsMatchActivationCode(platform, credentials);
          const context = await getAuthContext(platform);
          return { action: 'activate', context, credentials, rememberMe };
        } catch (err) {
          authError = (err as Error).name === 'EAUTH' ? (err as AuthError) : undefined;
          dispatch(authActions.sessionError(authError?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
          throw err;
        }
      } else {
        if (credentials) await Trackers.trackEvent('Auth', 'LOGIN ERROR', authError?.type);
        else await Trackers.trackEvent('Auth', 'RESTORE ERROR', authError?.type);
        dispatch(authActions.sessionError(authError?.type ?? RuntimeAuthErrorCode.UNKNOWN_ERROR));
        throw e;
      }
    }
  };
}

interface IActivationSubmitPayload extends IActivationPayload {
  callBack: string; // No idea what is it for...
  theme: string;
}

// ToDo : move API calls of this in service !
export function activateAccountAction(platform: Platform, model: IActivationPayload, rememberMe?: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState) => {
    try {
      // === 0 auto select the default theme
      const theme = platform.webTheme;
      if (!theme) {
        console.debug('[User][Activation] activationAccount -> theme was not found:', platform.webTheme);
      }
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
      // === 3 - Check whether the activation was successfull
      if (!res.ok) {
        throw createActivationError('activation', I18n.t('activation-errorSubmit'));
      }
      // a json response can contains an error field
      if (res.headers.get('content-type')?.indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          throw createActivationError('activation', resBody.error.message);
        }
      }

      // === Bonus : clear cookies. The backend send back a Set-Cookie header that conflicts with the oAuth2 token.
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
      else throw createActivationError('activation', I18n.t('activation-errorSubmit'), '', e as object);
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
 * removes the current stored auth error
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
 * This removes FCM and take the user to the auth stack.
 */
export function sessionInvalidateAction(platform: Platform, error?: AuthError) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // Unregister the device token from the backend
    console.debug('call removeFirebaseToken');
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
  callback: string; // WTF is it for ???
}

export function changePasswordAction(platform: Platform, p: IChangePasswordPayload, forceChange?: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      // === 1 - prepare payload
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
      // === 2 - Send change password information
      const res = await fetch(`${platform.url}/auth/reset`, {
        body: formdata,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-Device-Id': uniqueId(),
        },
        method: 'post',
      });
      // === 3 - Check whether the password change was successfull
      if (!res.ok) {
        throw createChangePasswordError('change password', I18n.t('changePassword-errorSubmit'));
      }
      // a json response can contains an error field
      if (res.headers.get('content-type') && res.headers.get('content-type')!.indexOf('application/json') !== -1) {
        // checking response header
        const resBody = await res.json();
        if (resBody.error) {
          const pwdRegex = getState().user.changePassword?.context?.passwordRegex;
          const regexp = new RegExp(pwdRegex);
          if (pwdRegex && !regexp.test(p.newPassword)) {
            throw createChangePasswordError('change password', I18n.t('changePassword-errorRegex'));
          } else {
            throw createChangePasswordError('change password', I18n.t('changePassword-errorFields'));
          }
        }
      }

      Trackers.trackEvent('Profile', 'CHANGE PASSWORD');
    } catch (e) {
      Trackers.trackEvent('Profile', 'CHANGE PASSWORD ERROR');
      if ((e as IChangePasswordError).name === 'ECHANGEPWD') throw e;
      else throw createChangePasswordError('change password', I18n.t('changePassword-errorSubmit'));
    }
  };
}
