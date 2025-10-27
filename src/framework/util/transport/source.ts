import { ImageRequireSource, ImageSourcePropType, ImageURISource } from 'react-native';

import { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { getAuthenticationHeader, getDeviceHeaders, getPlatformUrl } from './common';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { FetchError, FetchErrorCode } from '~/framework/util/http/error';

function isRequireSource(input: ImageSourcePropType): input is ImageRequireSource {
  return typeof input === 'number';
}

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

  result.uri = result.uri ? getPlatformUrl(result.uri, platform).toString() : result.uri;
  return result;
}

export function platformImageSource(platform: Platform, input: ImageSourcePropType): typeof input {
  if (isRequireSource(input)) return input;
  else if (Array.isArray(input)) return input.map(item => platformURISource(platform, item));
  else return platformURISource(platform, input);
}

// # ACCOUNT FETCH

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

  // Only sign urls that point toward the account's platform and scheme (https!).
  // This is important regarding to the security of the user's auth token.
  if (result.uri && result.uri.startsWith(platform.url)) {
    result.headers = {
      ...getAuthenticationHeader(account),
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

export function sessionURISource<SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  input: SourceType,
): typeof input {
  const account = getSession();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[sessionImageURISource] No session provided');
  return accountURISource(account, input);
}

export function sessionImageSource(input: ImageSourcePropType): typeof input {
  const account = getSession();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[sessionImageSource] No session provided');
  return accountImageSource(account, input);
}
