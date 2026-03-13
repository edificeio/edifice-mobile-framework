import CookieManager from '@react-native-cookies/cookies';

import {
  getAuthenticationHeaderForAccount,
  getAuthenticationHeaderForToken,
  getDeviceHeaders,
  getOriginRequest,
  getPlatformRequest,
  MAX_FETCH_TIMEOUT_MS,
} from './common';

import { AuthActiveAccount, AuthSavedLoggedInAccount, AuthTokenSet } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { isTokenExpired, refreshTokenForAccount } from '~/framework/util/oauth2';
import { FetchError, FetchErrorCode, HTTPError } from '~/framework/util/transport/error';

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
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.groupCollapsed(`[Fetch] ${getRequestMethod(input, init).toUpperCase()} ${getRequestUrl(input)}`);
    // eslint-disable-next-line no-console
    console.dir(input);
    // eslint-disable-next-line no-console
    console.dir(init);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
  CookieManager.clearAll();
  let response: Response;
  try {
    response = await global.fetch(input, init);
  } catch (e) {
    console.error(` ➔ Network Error`, e);
    throw new FetchError(
      FetchErrorCode.NETWORK_ERROR,
      `Failed to fetch resource: ${getRequestMethod(input, init)} ${getRequestUrl(input)}`,
      {
        cause: e,
      },
    );
  }
  if (!response.ok) {
    console.error(` ➔ ${response.status} ${response.statusText}`, await response.clone().text());
    throw new HTTPError(response);
  }
  if (__DEV__) {
    console.info(` ➔ ${response.status} ${response.statusText}`);
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

// #
// # DEVICE FETCH
// #

/**
 * deviceFetch
 * Fetch Method that automatically sets headers to identify the device type and the app (x-device-id, x-app, etc.)
 * Relies on `timeoutFetch` so the fetch will be canceled after a 30s pending time.
 *
 * @param input
 * @param init
 * @returns Fetch Response as a Promise
 */

export function deviceFetch(input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) {
  const headers = getDeviceHeaders();
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

export function getPlatformFetch(_platform: Pick<Platform, 'url'> | string) {
  const platform = typeof _platform === 'string' ? appConf.getExpandedPlatform(_platform) : _platform;
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[usePlatformFetch] No platform provided');
  return async (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) =>
    deviceFetch(await getPlatformRequest(input, platform), init);
}

/**
 * platformFetch
 * Fetch Method that automatically sets the host for the given fetch input from the given platform.
 * Relies on `deviceFetch` (so, includes timeout handling and device headers)
 *
 * @param input
 * @param init
 * @returns Fetch Response as a Promise
 */

export function platformFetch(platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) {
  return getPlatformFetch(platform)(...fetchArgs);
}
platformFetch.text = async (platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await platformFetch(platform, ...fetchArgs)).text();
platformFetch.json = async <ReturnType>(platform: Parameters<typeof getPlatformFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await platformFetch(platform, ...fetchArgs)).json() as ReturnType;

/**
 * tokenFetch
 * Fetch Method that automatically sets the host for the given fetch input from the given token.
 * Relies on `deviceFetch` (so, includes timeout handling and device headers)
 *
 * @param input
 * @param init
 * @returns Fetch Response as a Promise
 */

export function getTokenFetch(tokens: Pick<AuthTokenSet, 'access' | 'origin'>) {
  return async (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) =>
    deviceFetch(await getOriginRequest(input, tokens), {
      ...init,
      headers: {
        ...getAuthenticationHeaderForToken(tokens),
        ...init?.headers,
      },
    });
}

export function tokenFetch(tokens: Parameters<typeof getTokenFetch>[0], ...fetchArgs: Parameters<typeof fetch>) {
  return getTokenFetch(tokens)(...fetchArgs);
}
tokenFetch.text = async (tokens: Parameters<typeof getTokenFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await tokenFetch(tokens, ...fetchArgs)).text();
tokenFetch.json = async <ReturnType>(tokens: Parameters<typeof getTokenFetch>[0], ...fetchArgs: Parameters<typeof fetch>) =>
  (await tokenFetch(tokens, ...fetchArgs)).json() as ReturnType;

// # ACCOUNT (signed) FETCH

export function getAccountFetch(account: AuthSavedLoggedInAccount | AuthActiveAccount) {
  // 1. Get platform
  const platform = typeof account.platform === 'string' ? appConf.getExpandedPlatform(account.platform) : account.platform;
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[getAccountFetch] No platform provided');
  // 2. Check token origin match platform url
  if (platform.url !== account.tokens.origin) {
    console.error(
      `⚠️ Warning: you're trying to sign a request to ${platform.url} with a token obtained from ${account.tokens.origin}.\n
      For security reasons, the auth token won't be included to this request.`,
    );
    throw new FetchError(FetchErrorCode.TOKEN_ORIGIN_MISMATCH);
  }
  const _platformFetch = getPlatformFetch(platform);
  return async (input: Parameters<typeof _platformFetch>[0], init: Parameters<typeof _platformFetch>[1]) => {
    // 3. Refresh token if needed
    if (isTokenExpired(account.tokens.access)) {
      await refreshTokenForAccount(account);
      // ToDo: What to do if the refresh token fails?
    }
    // 4. Send request
    return await _platformFetch(input, {
      ...init,
      headers: {
        ...getAuthenticationHeaderForAccount(account),
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
