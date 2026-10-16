import appConf from '~/framework/util/appConf';
import { OAuth2Error, OAuth2ErrorCode, refreshTokenForAccount } from '~/framework/util/oauth2';
import { Trackers } from '~/framework/util/tracker';
import {
  AuthActiveAccount,
  AuthCredentials,
  AuthFederationCredentials,
  AuthLoggedAccount,
  AuthRequirement,
  AuthSavedLoggedInAccount,
  InitialAuthenticationMethod,
} from '~/modules/auth/model';

import { activateAccount } from './activation';
import { formatSession, formatStructuresWithClasses, parseAccountType } from './adapter';
import { changePassword } from './change-password';
import { forgot } from './forgot';
import { notifications } from './notifications';
import { platformConfig } from './platform';
import { requirements, requirementsThatNeedLegalUrls, revalidateTerms } from './requirements';
import { getOneSessionId, getQueryParamToken, getToken } from './token';
import type { SignInResult } from './types';
import * as userinfo from './userinfo';
import { emailValidation, mfaValidation, mobileValidation } from './validation';

/** Runs a sign-in step, tracking its failure and logging its duration. */
const step = async <T>(name: string, fn: () => Promise<T>) => {
  const start = Date.now();
  try {
    return await fn();
  } catch (e) {
    Trackers.trackDebugEvent('Auth', 'LOGIN ERROR', `signIn.${name}`);
    throw e;
  } finally {
    console.debug(`[perf] signIn.${name} in ${Date.now() - start}ms`);
  }
};

/**
 * Get default infos
 * - Fetch appropriate validation infos if must be verified
 * - Return default mobile or email
 */
async function getRequirementAdditionalInfos(requirement: AuthRequirement, tokens: Pick<AuthLoggedAccount, 'tokens'>) {
  let defaultMobile: string | undefined;
  let defaultEmail: string | undefined;
  if (requirement === AuthRequirement.MUST_VERIFY_MOBILE) {
    defaultMobile = (await mobileValidation.getValidationState(tokens))?.mobile;
  } else if (requirement === AuthRequirement.MUST_VERIFY_EMAIL) {
    defaultEmail = (await emailValidation.getValidationState(tokens))?.email;
  }
  return { defaultEmail, defaultMobile };
}

/**
 * Builds the session of the user owning the given tokens: checks requirements, gathers user information.
 * Does not touch any store: the result is up to the caller.
 */
const createSession = async (
  platformName: string,
  tokens: AuthLoggedAccount['tokens'],
  loginUsed: string | undefined,
  method: InitialAuthenticationMethod | undefined,
): Promise<SignInResult> => {
  const platform = appConf.assertPlatformOfName(platformName);
  const requirement = await step('getRequirement', () => requirements.get({ tokens }));
  const { privateInfos, publicInfos } = await step('getUserData', () => userinfo.getUserData({ tokens }, requirement));
  const logTimestamp = Date.now();
  const session: AuthActiveAccount = formatSession(
    tokens,
    logTimestamp, // addTimestamp: renewed only if the account is not already among the accounts, which is decided when it is set (see accounts store)
    logTimestamp,
    platform,
    loginUsed,
    privateInfos,
    method,
    publicInfos.userData,
    publicInfos.userPublicInfo,
  );
  const result: SignInResult = { session };

  if (requirement) {
    session.requirement = requirement;
    result.platformContext = await platformConfig.context(platform);
    const infos = await getRequirementAdditionalInfos(requirement, { tokens });
    session.user.mobile = infos.defaultMobile;
    session.user.email = infos.defaultEmail;
    if (requirementsThatNeedLegalUrls.includes(requirement)) {
      result.legalUrls = await platformConfig.authI18n(platform);
    }
  }
  return result;
};

/**
 * Every way to sign in. Each one returns the created session (and what comes with it) and does not touch any store.
 * Errors are thrown as is. In particular, `OAuth2ErrorCode.ACTIVATION_CODE` and `OAuth2ErrorCode.PASSWORD_RESET`
 * mean that given password was in fact an activation / password renew code.
 */
const signIn = {
  /**
   * With the tokens the account already has: gets a fresh session of the account (requirement, user data).
   * Not a sign-in: the tokens are not renewed, and it is up to the caller to keep the timestamps of the account.
   */
  refresh: async (account: AuthActiveAccount) => {
    const platformName = typeof account.platform === 'string' ? account.platform : account.platform.name;
    return createSession(platformName, account.tokens, (account.user as { loginUsed?: string }).loginUsed, account.method);
  },

  /** With the refresh token of a saved account. */
  restore: async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
    const platformName = typeof account.platform === 'string' ? account.platform : account.platform.name;
    const tokens = await step('refreshToken', () => refreshTokenForAccount(account));
    return createSession(platformName, tokens, (account.user as { loginUsed?: string }).loginUsed, account.method);
  },

  /** With login & password. */
  withCredentials: async (platformName: string, credentials: AuthCredentials) => {
    const tokens = await step('getToken', () => getToken(appConf.assertPlatformOfName(platformName), credentials));
    return createSession(platformName, tokens, credentials.username, InitialAuthenticationMethod.LOGIN_PASSWORD);
  },

  /** With a federation (SAML assertion or custom token). */
  withFederation: async (platformName: string, credentials: AuthFederationCredentials) => {
    try {
      const tokens = await step('getToken', () => getToken(appConf.assertPlatformOfName(platformName), credentials));
      return await createSession(platformName, tokens, undefined, InitialAuthenticationMethod.WAYF_SAML);
    } catch (e) {
      // "CREDENTIALS_MISMATCH" is the errcode obtained if the saml token does not link to an actual user account.
      // We override the error type to "SAML_INVALID" in this case.
      if (e instanceof OAuth2Error && e.code === OAuth2ErrorCode.CREDENTIALS_MISMATCH) {
        throw new OAuth2Error(OAuth2ErrorCode.SAML_INVALID, undefined, { cause: e.cause });
      }
      throw e;
    }
  },
};

/**
 * Everything the auth module asks to the outside world: the backend of the platform, and the notification service.
 * No store is touched here (see `flows/` for what is done with the answers).
 * Import it as a whole, so the calls read `service.xxx`:
 * `import service from '~/modules/auth/service';`
 * Types are in `./types`.
 */
const service = {
  activateAccount,
  assertNotPredeleted: userinfo.assertNotPredeleted,
  changePassword,
  emailValidation,
  fetchUserInfo: userinfo.fetchUserInfo,
  fetchUserPublicInfo: userinfo.fetchUserPublicInfo,
  forgot,
  formatSession,
  formatStructuresWithClasses,
  getOneSessionId,
  getQueryParamToken,
  getToken,
  getUserData: userinfo.getUserData,
  mfaValidation,
  mobileValidation,
  notifications,
  parseAccountType,
  platformConfig,
  requirements,
  requirementsThatNeedLegalUrls,
  revalidateTerms,
  signIn,
};

export default service;
