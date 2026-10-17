import { AuthRequirement, createChangePasswordSignInError, type IChangePasswordFormData } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { assertActiveAccount } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { I18n } from '~/util/i18n';

import { setAccount } from './set-account';

/**
 * The connected account changes its password, whether the user asked for it or the platform requires it
 * (requirement `MUST_CHANGE_PASSWORD`, which makes the change forced).
 * Its tokens are not valid anymore afterwards, so the account signs in again with the new password.
 * Nothing is done to the session in case of a failure: it is up to the caller (see `changePasswordRequirement`).
 * @throws a change password error (`ECHANGEPWD`) if the change is refused.
 * @throws a sign-in error (`ECHANGEPWD_SIGNIN`, the cause is the sign-in error) if the password was changed but signing in again failed.
 */
export const changePassword = async ({ confirm, newPassword, oldPassword }: IChangePasswordFormData) => {
  const account = assertActiveAccount();
  const platform = typeof account.platform === 'string' ? account.platform : account.platform.name;
  const login = account.user.login;

  await service.changePassword(
    platform,
    { confirm, login, newPassword, oldPassword },
    {
      forceChange: account.requirement === AuthRequirement.MUST_CHANGE_PASSWORD,
      passwordRegex: usePlatformContextStore.getState().contexts[platform]?.passwordRegex,
    },
  );
  try {
    return await setAccount(
      await service.signIn.withCredentials(platform, { password: newPassword, username: login }),
      account.user.id,
    );
  } catch (e) {
    // @todo UX to decide for a change asked by the user (no requirement): the password is changed but the session keeps its old tokens,
    // which the platform may have invalidated. Either tell the user and let them go on, or log the account out and send it to its
    // login screen (as `changePasswordRequirement` does). The screen that gets this error must also stop showing a generic error toast.
    throw createChangePasswordSignInError(I18n.get('auth-changepassword-error-signin'), e as Error);
  }
};
