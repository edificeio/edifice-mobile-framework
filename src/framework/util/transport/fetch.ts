import CookieManager from '@react-native-cookies/cookies';
import DeviceInfo, { getDeviceId } from 'react-native-device-info';

import { FetchError, FetchErrorCode, HTTPError } from '../http/error';
import { isTokenExpired, refreshTokenForAccount } from '../oauth2';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';

const MAX_FETCH_TIMEOUT_MS = 30000; // 30 seconds

const DEFAULT_HEADERS = {
  'X-APP': 'mobile',
  'X-APP-NAME': DeviceInfo.getApplicationName(),
  'X-APP-VERSION': DeviceInfo.getReadableVersion(),
};

const deviceIdHeaderName = 'X-Device-Id';

// # UTILITY FUNCTIONS

/**
 * Returns the url that will be used by the provided fetch arguments
 * @param input
 * @returns
 */
function getRequestUrl(input: Parameters<typeof fetch>[0]) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  else return input.url;
}

/**
 * Returns the method that will be used by the provided fetch arguments
 * @param input
 * @param init
 * @returns
 */
function getRequestMethod(input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) {
  if (init?.method) return init.method;
  if (input instanceof Request) return input.method;
  else return 'get';
}

// # BASE FETCH

/**
 * Fetches a resource from the network while handling errors and clearing cookies.
 *
 * @param info - The resource that you wish to fetch. This can either be a string containing the URL of the resource, or a Request object.
 * @param init - An optional object containing any custom settings that you want to apply to the request.
 * @returns A promise that resolves to the Response object representing the response to the request.
 * @throws {FetchError} If there is a network error during the fetch operation.
 * @throws {HTTPError} If the response status is not ok (status is not in the range 200-299).
 */
const _baseFetch = async (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]): Promise<Response> => {
  CookieManager.clearAll();
  let response: Response;
  try {
    if (__DEV__) {
      console.debug(`[Fetch] ${getRequestMethod(input, init).toUpperCase()} ${getRequestUrl(input)}`);
      console.debug(
        JSON.stringify(new Request(input, init), null, '  ').replaceAll(/\n/g, '\n                                   '),
      );
    }
    response = await global.fetch(input, init);
    if (__DEV__) {
      console.debug(`➔ ${response.status} ${response.statusText}`);
    }
  } catch (e) {
    console.error(`➔ Network Error`, e);
    throw new FetchError(
      FetchErrorCode.NETWORK_ERROR,
      `Failed to fetch resource: ${getRequestMethod(input, init)} ${getRequestUrl(input)}`,
      {
        cause: e,
      },
    );
  }
  if (!response.ok) {
    if (__DEV__) {
      console.error(`  ➔ ${response.status} ${response.statusText}`);
      console.error(await response.clone().text());
    }
    throw new HTTPError(response);
  }
  return response;
};

/**
 * Wraps a fetch function with a timeout mechanism.
 *
 * @param fetchFn - The fetch function to be wrapped.
 * @returns A function that performs a fetch request with a timeout.
 *
 * @param info - The resource that you want to fetch.
 * @param init - An optional object containing any custom settings that you want to apply to the request.
 * @returns A Promise that resolves to the Response object representing the response to the request.
 *
 * @throws {Error} If the request times out, an AbortError is thrown.
 */
const timeoutFetch =
  (fetchFn: typeof fetch) =>
  async (info: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT_MS);
    try {
      return await fetchFn(info, { ...init, signal: controller.signal });
    } catch (e) {
      const deepError = Error.getDeepError(e);
      if (deepError instanceof global.Error && deepError.name === 'AbortError') {
        throw new FetchError(FetchErrorCode.TIMEOUT, undefined, { cause: e });
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  };

export const baseFetch = timeoutFetch(_baseFetch);

// # DEVICE FETCH

export function deviceFetch(input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) {
  const headers = {
    ...DEFAULT_HEADERS,
    [deviceIdHeaderName]: getDeviceId(),
  };
  if (input instanceof Request) {
    input.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
  }
  Object.assign(headers, init?.headers);
  return baseFetch(input, {
    ...init,
    headers,
  });
}
deviceFetch.text = async (...fetchArgs: Parameters<typeof fetch>) => (await deviceFetch(...fetchArgs)).text();
deviceFetch.json = async <ReturnType>(...fetchArgs: Parameters<typeof fetch>) =>
  (await deviceFetch(...fetchArgs)).json() as ReturnType;

// # PLATFORM FETCH

const getPlatformRequest = (input: Parameters<typeof fetch>[0], platform: Platform) => {
  if (typeof input === 'string') {
    return new URL(input, platform.url).toString();
  } else if (input instanceof URL) {
    return new URL(input, platform.url);
  } else {
    return new Request(new URL(input.url, platform.url), input);
  }
};

export function getPlatformFetch(_platform: Platform | string) {
  const platform = appConf.getExpandedPlatform(_platform);
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[usePlatformFetch] No platform provided');
  return (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) =>
    deviceFetch(getPlatformRequest(input, platform), init);
}

export function platformFetch(platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) {
  return getPlatformFetch(platform)(...fetchArgs);
}
platformFetch.text = async (platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await platformFetch(platform, ...fetchArgs)).text();
platformFetch.json = async <ReturnType>(platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await platformFetch(platform, ...fetchArgs)).json() as ReturnType;

// # ACCOUNT (signed) FETCH

export function getAccountFetch(account: AuthSavedLoggedInAccount | AuthActiveAccount) {
  const _platformFetch = getPlatformFetch(account.platform);
  return async (input: Parameters<typeof _platformFetch>[0], init: Parameters<typeof _platformFetch>[1]) => {
    if (isTokenExpired(account.tokens.access)) {
      await refreshTokenForAccount(account);
      // ToDo: What to do if the refresh token fails?
    }
    return await _platformFetch(input, {
      ...init,
      headers: {
        Authorization: `${account.tokens.access.type} ${account.tokens.access.value}`,
        ...init?.headers,
      },
    });
  };
}

export function accountFetch(account: Parameters<typeof getAccountFetch>[0], ...fetchArgs: Parameters<typeof fetch>) {
  return getAccountFetch(account)(...fetchArgs);
}
accountFetch.text = async (account: Parameters<typeof getAccountFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await accountFetch(account, ...fetchArgs)).text();
accountFetch.json = async <ReturnType>(account: Parameters<typeof getAccountFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await accountFetch(account, ...fetchArgs)).json() as ReturnType;

// # SESSION (signed, active account) FETCH

export function getSessionFetch() {
  const account = getSession();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[useSessionFetch] No session provided');
  return getAccountFetch(account);
}

export function sessionFetch(...fetchArgs: Parameters<typeof fetch>) {
  return getSessionFetch()(...fetchArgs);
}
sessionFetch.text = async (...fetchArgs: Parameters<typeof fetch>) => (await sessionFetch(...fetchArgs)).text();
sessionFetch.json = async <ReturnType>(...fetchArgs: Parameters<typeof fetch>) =>
  (await sessionFetch(...fetchArgs)).json() as ReturnType;
