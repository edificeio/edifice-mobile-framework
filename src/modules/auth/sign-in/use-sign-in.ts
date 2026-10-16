import React from 'react';

import { Error } from '~/framework/util/error';
import { OAuth2Error, OAuth2ErrorCode } from '~/framework/util/oauth2';
import { withTracking } from '~/modules/auth/flows/track';
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
import { useSignInStore } from '~/modules/auth/store/sign-in';
import track from '~/modules/auth/tracking';
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
              useSignInStore
                .getState()
                .setStatus({ code: credentials.password, loginUsed: credentials.username, platform, type: 'activation' });
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
   * Signs in with the credentials that were just set up (activation, password change).
   * If it fails, the user is sent back to the login screen of the platform, where the error is shown.
   */
  const signInAfterSetup = React.useCallback(
    async (platform: string, credentials: AuthCredentials, accountToReplaceId?: string) => {
      try {
        await onSignedIn(await service.signIn.withCredentials(platform, credentials), accountToReplaceId);
      } catch (e) {
        console.error('[Auth] Sign in after setup error :', e);
        const { setError, setStatus } = useSignInStore.getState();
        setStatus({ loginUsed: credentials.username, platform, type: 'restore' });
        setError({ info: e as Error, key: undefined });
        throw e;
      }
    },
    [onSignedIn],
  );

  /**
   * Activates the account then signs in.
   * @throws an activation error, whatever the cause.
   */
  const activate = React.useCallback(
    async (platform: string, model: IActivationPayload) => {
      try {
        await withTracking(track.activation, async () => {
          await service.activateAccount(platform, model);
          await signInAfterSetup(platform, { password: model.password, username: model.login });
        });
      } catch (e) {
        if ((e as IActivationError).name === 'EACTIVATION') throw e;
        else if (e instanceof global.Error)
          throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '', e);
        else throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'), '');
      }
    },
    [signInAfterSetup],
  );

  /**
   * Changes the password then signs in.
   * @param passwordRegex regex of the platform password rules, to tell the user why the new password was refused.
   * @throws a change password error if the password change fails, or the sign-in error.
   */
  const changePassword = React.useCallback(
    async (platform: string, payload: IChangePasswordPayload, options?: { forceChange?: boolean; accountToReplaceId?: string }) => {
      await service.changePassword(platform, payload, options);
      await signInAfterSetup(platform, { password: payload.newPassword, username: payload.login }, options?.accountToReplaceId);
    },
    [signInAfterSetup],
  );

  return { activate, changePassword, withCredentials, withFederation };
};
