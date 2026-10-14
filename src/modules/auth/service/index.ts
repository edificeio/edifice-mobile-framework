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
} from '../model';
import { formatSession } from './adapter';
import { platformConfig } from './platform';
import { requirements, requirementsThatNeedLegalUrls } from './requirements';
import { getToken } from './token';
import type { SignInResult } from './types';
import * as userinfo from './userinfo';
import { emailValidation, mobileValidation } from './validation';

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
export const signIn = {
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

export * from './adapter';
export * from './platform';
export * from './requirements';
export * from './token';
export * from './types';
export * from './userinfo';
export * from './validation';
export * from './activation';
export * from './change-password';
export * from './forgot';
