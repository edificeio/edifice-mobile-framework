import DeviceInfo, { getDeviceId } from 'react-native-device-info';

import { Platform } from '../appConf';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';

export const MAX_FETCH_TIMEOUT_MS = 30000; // 30 seconds

export const DEFAULT_HEADERS = {
  'X-APP': 'mobile',
  'X-APP-NAME': DeviceInfo.getApplicationName(),
  'X-APP-VERSION': DeviceInfo.getReadableVersion(),
};

export const deviceIdHeaderName = 'X-Device-Id';

export const getDeviceHeaders = () => ({
  ...DEFAULT_HEADERS,
  [deviceIdHeaderName]: getDeviceId(),
});

/**
 * Sets the URL with the domain of given platform, only if given URL has no domain.
 * @param url
 * @param platform
 * @returns
 */
export const getPlatformUrl = (url: string | URL, platform: Platform) => {
  if (typeof url === 'string') {
    return url.startsWith('/') ? new URL(url, platform.url).toString() : url;
  } else {
    // URL object cannot be without domain.
    return url;
  }
};

export const getAuthenticationHeader = (account: AuthSavedLoggedInAccount | AuthActiveAccount) => ({
  Authorization: `${account.tokens.access.type} ${account.tokens.access.value}`,
});
