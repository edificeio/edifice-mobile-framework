import DeviceInfo from 'react-native-device-info';

import appConf from '~/framework/util/appConf';
import { platformFetch } from '~/framework/util/transport';
import { I18n } from '~/util/i18n';

import { createChangePasswordError, type IChangePasswordError, type IChangePasswordPayload } from '../model';

interface ChangePasswordSubmitPayload {
  oldPassword?: string;
  password: string;
  confirmPassword: string;
  login: string;
  callback: string;
  resetCode?: string;
  forceChange?: string;
}

/**
 * Changes the password of the user (with its old password, or a reset code), through the web form of the platform.
 * Does not sign in: the caller must do it with the new password.
 * @param passwordRegex regex of the platform password rules, to tell the user why the new password was refused.
 * @throws a change password error (see `createChangePasswordError`)
 */
export async function changePassword(
  platformName: string,
  p: IChangePasswordPayload,
  { forceChange, passwordRegex }: { forceChange?: boolean; passwordRegex?: string } = {},
) {
  try {
    const payload: ChangePasswordSubmitPayload = {
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
      const value = payload[key as keyof ChangePasswordSubmitPayload];
      if (value) formdata.append(key, value);
    }
    const deviceId = await DeviceInfo.getUniqueId();
    if (!deviceId) {
      throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
    }
    const res = await platformFetch(appConf.assertPlatformOfName(platformName), `/auth/reset`, {
      body: formdata,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      method: 'post',
    });
    // Check whether the password change was successful
    if (!res.ok) {
      throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-submit'));
    }
    // a json response can contains an error field
    if (res.headers.get('content-type')?.includes('application/json')) {
      const resBody = await res.json();
      if (resBody.error) {
        if (passwordRegex && !new RegExp(passwordRegex).test(p.newPassword)) {
          throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-regex'));
        } else {
          throw createChangePasswordError('change password', I18n.get('auth-changepassword-error-fields'));
        }
      }
    }
  } catch (e) {
    if ((e as IChangePasswordError).name === 'ECHANGEPWD') throw e;
    throw createChangePasswordError(
      'change password',
      I18n.get('auth-changepassword-error-submit'),
      undefined,
      e instanceof global.Error ? e : undefined,
    );
  }
}
