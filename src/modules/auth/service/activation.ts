import CookieManager from '@preeternal/react-native-cookie-manager';
import { getFormattedNumber, isMobileNumber, isValidNumber } from 'react-native-phone-number-input';

import appConf from '~/framework/util/appConf';
import { platformFetch } from '~/framework/util/transport';
import { I18n } from '~/util/i18n';

import { createActivationError, type IActivationPayload } from '../model';

interface ActivationSubmitPayload extends IActivationPayload {
  callBack: string;
  theme: string;
}

/**
 * Activates the account of the user, using the activation code it received.
 * @throws an activation error (see `createActivationError`) if the platform refuses it.
 */
export async function activateAccount(platformName: string, model: IActivationPayload) {
  const platform = appConf.assertPlatformOfName(platformName);
  const theme = platform.webTheme;
  const phoneNumber = model.phone;
  const phonePrefix = model.phoneCountry;

  const getIsValidMobileNumberForRegion = (toVerify: string) => {
    try {
      // Don't throw an error if phone number is not required by platform
      if (toVerify === '') return true;
      // Returns whether number is valid for selected region and an actual mobile number
      return isValidNumber(toVerify, phonePrefix) && isMobileNumber(toVerify, phonePrefix);
    } catch {
      // Returns false in case of format error (string is too short, isn't recognized as a phone number, etc.)
      return false;
    }
  };

  const phoneNumberCleaned = phoneNumber.replaceAll(/[-.]+/g, '');
  if (!getIsValidMobileNumberForRegion(phoneNumberCleaned)) throw new global.Error('Invalid mobile number submitted');

  const mobileNumberFormatted = getFormattedNumber(phoneNumberCleaned, phonePrefix);

  const payload: Omit<ActivationSubmitPayload, 'mailState' | 'phoneCountry' | 'phoneState'> = {
    acceptCGU: true,
    activationCode: model.activationCode,
    callBack: '',
    confirmPassword: model.confirmPassword,
    login: model.login,
    mail: model.mail || '',
    password: model.password,
    phone: mobileNumberFormatted || '',
    theme,
  };

  const formdata = new FormData();
  for (const key in payload) {
    formdata.append(key, payload[key as keyof typeof payload]);
  }
  const res = await platformFetch(platform, `/auth/activation/no-login`, {
    body: formdata,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    method: 'POST',
  });
  if (!res.ok) {
    throw createActivationError('activation', I18n.get('auth-activation-errorsubmit'));
  }
  if (res.headers.get('content-type')?.indexOf('application/json') !== -1) {
    const resBody = await res.json();
    if (resBody.error) {
      throw createActivationError('activation', resBody.error.message);
    }
  }
  await CookieManager.clearAll();
}
