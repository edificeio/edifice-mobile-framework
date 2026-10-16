import type { IChangePasswordFormData } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { assertConnectedAccount } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { logout } from './logout';
import { setAccount } from './set-account';

/**
 * The connected account changes its password because the platform requires it (requirement `MUST_CHANGE_PASSWORD`).
 * Its tokens are not valid anymore afterwards, so the account signs in again with the new password.
 * If that sign-in fails, the account is logged out and the user is sent back to the login screen, with the error.
 * @throws a change password error if the change is refused, else the sign-in error.
 */
export const changeRequiredPassword = async ({ confirm, newPassword, oldPassword }: IChangePasswordFormData) => {
  const account = assertConnectedAccount();
  const platform = typeof account.platform === 'string' ? account.platform : account.platform.name;
  const login = account.user.login;

  await service.changePassword(
    platform,
    { confirm, login, newPassword, oldPassword },
    { forceChange: true, passwordRegex: usePlatformContextStore.getState().contexts[platform]?.passwordRegex },
  );
  try {
    return await setAccount(
      await service.signIn.withCredentials(platform, { password: newPassword, username: login }),
      account.user.id,
    );
  } catch (e) {
    console.error('[Auth] Sign in after required password change error :', e);
    await logout();
    const { setError, setStatus } = useSignInStore.getState();
    setStatus({ loginUsed: login, platform, type: 'restore' });
    setError({ info: e as Error, key: undefined });
    throw e;
  }
};
