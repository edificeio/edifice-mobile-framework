import DeviceInfo, { getDeviceId } from 'react-native-device-info';

import { AuthActiveAccount, AuthSavedLoggedInAccount, AuthTokenSet } from '~/framework/modules/auth/model';
import { Platform } from '~/framework/util/appConf';

export const MAX_FETCH_TIMEOUT_MS = 30000; // 30 seconds

export const DEFAULT_HEADERS = {
  'X-APP': 'mobile',
  'X-APP-NAME': DeviceInfo.getBundleId(),
  'X-APP-VERSION': DeviceInfo.getReadableVersion(),
};

export const deviceIdHeaderName = 'X-Device-Id';

export const getDeviceHeaders = () => ({
  ...DEFAULT_HEADERS,
  [deviceIdHeaderName]: getDeviceId(),
});

/**
 * Set the origin if the given url has no origin.
 * @param input
 * @param base
 * @returns
 */
export const getUrlWithBase = <T extends string | URL>(input: T, base: string): T => {
  return typeof input === 'string' && input.startsWith('/') ? (new URL(input, base).toString() as T) : input;
};

export const getPlatformRequest = async (input: Parameters<typeof fetch>[0], platform: Pick<Platform, 'url'>) => {
  if (typeof input === 'string' || input instanceof URL) {
    return getUrlWithBase(input, platform.url);
  } else {
    const inputClone = input.clone();
    const bodyContent = await inputClone.text(); // ou .json(), .blob(), etc.

    const ret = new Request(getUrlWithBase(input.url, platform.url), {
      ...input,
      body: bodyContent,
    });

    return ret;
  }
};

export const getUrlForToken = <T extends string | URL>(input: T, token: Pick<AuthTokenSet, 'origin'>) => {
  return getUrlWithBase(input, token.origin);
};

export const getOriginRequest = async (input: Parameters<typeof fetch>[0], token: Pick<AuthTokenSet, 'origin'>) => {
  if (typeof input === 'string' || input instanceof URL) {
    return getUrlForToken(input, token);
  } else {
    const inputClone = input.clone();
    const bodyContent = await inputClone.text(); // ou .json(), .blob(), etc.

    const ret = new Request(getUrlForToken(input.url, token), {
      ...input,
      body: bodyContent,
    });

    return ret;
  }
};

/**
 * Sets the URL with the domain of given platform, only if given URL has no domain.
 * @param url
 * @param platform
 * @returns
 */
export const getPlatformUrl = (url: string | URL, platform: Pick<Platform, 'url'>) => {
  if (typeof url === 'string') {
    return url.startsWith('/') ? new URL(url, platform.url).toString() : url;
  } else {
    // URL object cannot be without domain.
    return url;
  }
};

export const getAuthenticationHeaderForToken = (tokens: Pick<AuthTokenSet, 'access'>) => ({
  Authorization: `${tokens.access.type} ${tokens.access.value}`,
});

export const getAuthenticationHeaderForAccount = (account: Pick<AuthSavedLoggedInAccount | AuthActiveAccount, 'tokens'>) =>
  getAuthenticationHeaderForToken(account.tokens);
