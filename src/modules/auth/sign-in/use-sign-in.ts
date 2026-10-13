import React from 'react';

import { Error } from '~/framework/util/error';
import { OAuth2Error, OAuth2ErrorCode } from '~/framework/util/oauth2';
import {
  AuthCredentials,
  AuthFederationCredentials,
  AuthPendingRedirection,
  createActivationError,
  type IActivationError,
  type IActivationPayload,
  type IChangePasswordPayload,
} from '~/modules/auth/model';
import service from '~/modules/auth/service';
import type { SignInResult } from '~/modules/auth/service/types';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { getPlatformContext } from '~/modules/auth/store/platform-context';
import track, { withTracking } from '~/modules/auth/tracking';
import { I18n } from '~/util/i18n';

import { useSignInContext } from './context';

/**
 * A sign-in attempt either gives a session, or ends up on a redirection (activation / password renew code was used).
 * The tracking needs the redirection as the returned value, so both are returned by the same function.
 */
const isSignInResult = (outcome: SignInResult | AuthPendingRedirection): outcome is SignInResult =>
  !Object.values(AuthPendingRedirection).includes(outcome as AuthPendingRedirection);

const hasOAuth2Code = (e: unknown, code: OAuth2ErrorCode) =>
  Error.findCause(e, (error): error is OAuth2Error => error instanceof OAuth2Error && error.code === code);

/**
 * The ways to sign in for the screens of the sign-in module.
 * - When it succeeds, the result is given to the `onSignedIn` of the context.
 * - If the user typed an activation / password renew code instead of its password, the sign-in status is set accordingly
 *   (which makes the navigator show the matching screen).
 * - Else, the error is linked to the screen (`screenKey`) in the sign-in store, then thrown back.
 */
export const useSignIn = () => {
  const { onSignedIn } = useSignInContext();

  const withCredentials = React.useCallback(
    async (platform: string, credentials: AuthCredentials, screenKey?: number, accountToReplaceId?: string) => {
      try {
        const outcome = await withTracking(track.loginCredentials, async () => {
          try {
            return await service.signIn.withCredentials(platform, credentials);
          } catch (e) {
            // "CREDENTIALS_MISMATCH" caused by the use of an activation / renew code
            if (hasOAuth2Code(e, OAuth2ErrorCode.ACTIVATION_CODE)) {
              useSignInStore.getState().setStatus({
                accountId: accountToReplaceId,
                code: credentials.password,
                loginUsed: credentials.username,
                platform,
                type: 'activation',
              });
              return AuthPendingRedirection.ACTIVATE;
            } else if (hasOAuth2Code(e, OAuth2ErrorCode.PASSWORD_RESET)) {
              useSignInStore.getState().setStatus({
                accountId: accountToReplaceId,
                code: credentials.password,
                loginUsed: credentials.username,
                platform,
                type: 'passwordRenew',
              });
              return AuthPendingRedirection.RENEW_PASSWORD;
            }
            throw e;
          }
        });
        if (isSignInResult(outcome)) await onSignedIn(outcome, accountToReplaceId);
      } catch (e) {
        console.error('[Auth] Login credentials error :', e);
        useSignInStore.getState().setError({ info: e as Error, key: screenKey });
        throw e;
      }
    },
    [onSignedIn],
  );

  const withFederation = React.useCallback(
    async (platform: string, credentials: AuthFederationCredentials, screenKey?: number, accountToReplaceId?: string) => {
      try {
        const result = await withTracking(track.loginFederation, () => service.signIn.withFederation(platform, credentials));
        await onSignedIn(result, accountToReplaceId);
      } catch (e) {
        console.error('[Auth] Login federation error :', e);
        useSignInStore.getState().setError({ info: e as Error, key: screenKey });
        throw e;
      }
    },
    [onSignedIn],
  );

  /**
   * Signs in with the password the user just chose, at the end of an activation, a password renewal or a password change:
   * these flows create or replace the password, then the user must be signed in with it.
   * If it fails, the user is sent back to the login screen of the platform, where the error is shown.
   */
  const signInWithNewPassword = React.useCallback(
    async (platform: string, credentials: AuthCredentials, accountToReplaceId?: string) => {
      try {
        await onSignedIn(await service.signIn.withCredentials(platform, credentials), accountToReplaceId);
      } catch (e) {
        console.error('[Auth] Sign in with new password error :', e);
        const { setError, setStatus } = useSignInStore.getState();
        setStatus({ accountId: accountToReplaceId, loginUsed: credentials.username, platform, type: 'login' });
        setError({ info: e as Error, key: undefined });
        throw e;
      }
    },
    [onSignedIn],
  );

  /**
   * Activates the account then signs in.
   * @param accountToReplaceId the saved account the sign-in was aiming at, like for a regular sign-in.
   * @throws an activation error, whatever the cause.
   */
  const activate = React.useCallback(
    async (platform: string, model: IActivationPayload, accountToReplaceId?: string) => {
      try {
        await withTracking(track.activation, async () => {
          await service.activateAccount(platform, model);
          await signInWithNewPassword(platform, { password: model.password, username: model.login }, accountToReplaceId);
        });
      } catch (e) {
        if ((e as IActivationError).name === 'EACTIVATION') throw e;
        else if (e instanceof global.Error)
          throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e);
        else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '');
      }
    },
    [signInWithNewPassword],
  );

  /**
   * Changes the password then signs in.
   * The password rules of the platform (already loaded by the screen that asks for the new password) are given to the service,
   * to tell the user why a new password was refused.
   * @throws a change password error if the password change fails, or the sign-in error.
   */
  const changePassword = React.useCallback(
    async (platform: string, payload: IChangePasswordPayload, options?: { forceChange?: boolean; accountToReplaceId?: string }) => {
      await service.changePassword(platform, payload, {
        forceChange: options?.forceChange,
        passwordRegex: getPlatformContext(platform)?.passwordRegex,
      });
      await signInWithNewPassword(
        platform,
        { password: payload.newPassword, username: payload.login },
        options?.accountToReplaceId,
      );
    },
    [signInWithNewPassword],
  );

  return { activate, changePassword, withCredentials, withFederation };
};
