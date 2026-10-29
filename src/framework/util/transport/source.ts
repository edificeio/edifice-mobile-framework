import { ImageSourcePropType, ImageURISource } from 'react-native';

import type { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import appConf, { Platform } from '~/framework/util/appConf';
import { FetchError, FetchErrorCode } from '~/framework/util/transport/error';
import { getActiveAccount } from '~/modules/auth/store/accounts';
import { isRequireSource } from '~/modules/media/util';

import { getAuthenticationHeaderForAccount, getDeviceHeaders, getUrlWithBase } from './common';

// # DEVICE FETCH

export function deviceURISource<SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  input: SourceType,
): typeof input {
  return {
    ...input,
    headers: {
      ...getDeviceHeaders(),
      ...input.headers,
    },
  };
}

export function deviceImageSource(input: ImageSourcePropType): typeof input {
  if (isRequireSource(input)) return input;
  else if (Array.isArray(input)) return input.map(deviceURISource);
  else return deviceURISource(input);
}

// # PLATFORM FETCH

export function platformURISource<SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  platform: Platform,
  input: SourceType,
): typeof input {
  const result = deviceURISource(input);

  // Local file URL passthrough
  if (result.uri && result.uri.startsWith('file://')) {
    return result;
  }

  result.uri = result.uri ? getUrlWithBase(result.uri, platform.url).toString() : result.uri;
  return result;
}

export function platformImageSource(platform: Platform, input: ImageSourcePropType): typeof input {
  if (isRequireSource(input)) return input;
  else if (Array.isArray(input)) return input.map(item => platformURISource(platform, item));
  else return platformURISource(platform, input);
}

// # ACCOUNT FETCH

/**
 * Whether both urls have the same origin. An url that can't be parsed has none: it is never the same.
 */
export const hasSameOrigin = (url: string, otherUrl: string) => {
  try {
    return new URL(url).origin === new URL(otherUrl).origin;
  } catch {
    return false;
  }
};

export function accountURISource<SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  input: SourceType,
): typeof input {
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[accountImageURISource] No platform provided');

  const result = platformURISource(platform, input);

  // Do not sign URLs to local files.
  if (result.uri && result.uri.startsWith('file://')) {
    return result;
  }

  // Only sign urls that point toward the account's platform: same origin (scheme, host and port), not just the same beginning
  // (`https://ent.fr.evil.com` starts like `https://ent.fr`). This is important regarding to the security of the user's auth token.
  if (result.uri && hasSameOrigin(result.uri, platform.url)) {
    result.headers = {
      ...getAuthenticationHeaderForAccount(account),
      ...result.headers,
    };
  }
  return result;
}

export function accountImageSource(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  input: ImageSourcePropType,
): typeof input {
  if (isRequireSource(input)) return input;
  else if (Array.isArray(input)) return input.map(item => accountURISource(account, item));
  else return accountURISource(account, input);
}

// # SESSION FETCH
// "Session" here is the connected account, even if it still has a requirement to fulfil (terms...): it has its tokens, and what it needs to
// show (the terms pdf...) is signed like the rest.

export function sessionURISource<SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  input: SourceType,
): typeof input {
  const account = getActiveAccount();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[sessionImageURISource] No connected account');
  return accountURISource(account, input);
}

export function sessionImageSource(input: ImageSourcePropType): typeof input {
  const account = getActiveAccount();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[sessionImageSource] No connected account');
  return accountImageSource(account, input);
}
