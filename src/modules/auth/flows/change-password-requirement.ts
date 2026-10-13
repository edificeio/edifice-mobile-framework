import type { IChangePasswordFormData, IChangePasswordSignInError } from '~/modules/auth/model';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { assertActiveAccount } from '~/modules/auth/store/accounts';

import type { createChangePassword } from './change-password';
import type { LogoutFlow } from './logout';

/**
 * `changePassword`, for the requirement `MUST_CHANGE_PASSWORD`: the user can't be left signed in with tokens that are not valid.
 * - If the change is refused, the user stays on the screen with the error.
 * - If the change is done but signing in again fails, the account is logged out and the user is sent back to its login screen,
 *   with the sign-in error.
 * @throws the error of `changePassword`.
 */
export const createChangePasswordRequirement =
  (changePassword: ReturnType<typeof createChangePassword>, logout: LogoutFlow) => async (form: IChangePasswordFormData) => {
    const account = assertActiveAccount();
    try {
      return await changePassword(form);
    } catch (e) {
      // The change was refused: nothing happened to the account.
      if ((e as IChangePasswordSignInError).name !== 'ECHANGEPWD_SIGNIN') throw e;
      console.error('[Auth] Sign in after required password change error :', e);
      await logout();
      const { setError, setStatus } = useSignInStore.getState();
      setStatus({
        loginUsed: account.user.login,
        platform: typeof account.platform === 'string' ? account.platform : account.platform.name,
        type: 'login',
      });
      setError({ info: (e as IChangePasswordSignInError).cause as Error, key: undefined });
      throw e;
    }
  };
