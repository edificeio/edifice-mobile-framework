import CookieManager from '@preeternal/react-native-cookie-manager';

import { AuthActiveAccount, AuthSavedLoggedInAccount, AuthTokenSet } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import appConf, { Platform } from '~/framework/util/appConf';
import { isTokenExpired } from '~/framework/util/oauth2';
import { Trackers } from '~/framework/util/tracker';
import { FetchError, FetchErrorCode, HTTPError } from '~/framework/util/transport/error';
import { refreshOAuth2Token } from '~/modules/auth/flows/refresh-oauth2-token';
import { getAccountWithTokens } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

import {
  getAuthenticationHeaderForAccount,
  getAuthenticationHeaderForToken,
  getDeviceHeaders,
  getOriginRequest,
  getPlatformRequest,
} from './common';
import { trackSignedRequest } from './in-flight';
import { timeoutFetch } from './timeout-fetch';

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
  const headers: Record<string, string> = getDeviceHeaders();
  headers['Accept-Language'] = I18n.getLanguage();
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

/**
 * A fetch function that signs its requests with the tokens of an account.
 *
 * It is tied to the **id** of the account, and reads the tokens of the account when each request starts: the most recent ones, even if
 * they were refreshed by another request meanwhile. Given an account **object**, it also works with that object when the store does not
 * know the account (yet), or does not have its tokens anymore: the object is then the credential.
 *
 * Its requests are canceled when the session of the account ends (see `abortSignedRequests`), or when the `signal` they were given
 * aborts. They then throw a `FetchError` `SESSION_ENDED` or `ABORTED`, not a `TIMEOUT`.
 *
 * @todo: separate usages with id VS with account data.
 */
export function getAccountFetch(accountOrId: AuthSavedLoggedInAccount | AuthActiveAccount | string) {
  const id = typeof accountOrId === 'string' ? accountOrId : accountOrId.user.id;
  const given = typeof accountOrId === 'string' ? undefined : accountOrId;
  const current = () => {
    const account = getAccountWithTokens(id) ?? given;
    if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, `[getAccountFetch] No signed in account of id ${id}`);
    return account;
  };
  // 1. Get platform
  const account = current();
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
    // 3. Refresh token if needed: with the most recent tokens, and one refresh at a time for the account
    if (isTokenExpired(current().tokens.access)) {
      Trackers.handleRefreshToken();
      // The object given (if any) gets the new tokens, as it always did; a copy of the account of the store is enough for an id.
      await refreshOAuth2Token(given ?? { ...current() });
      // ToDo: What to do if the refresh token fails?
      // TODO(auth-migration): the transport should depend on `useAuthFlows()` (`~/modules/auth/flows`), not on the
      // static `refreshOAuth2Token`: when the token can't be refreshed, it may have to call `logout` (which ends the session through the
      // hooks of the modules, so it can't be imported directly). It then needs the flows given to it (a hook, or injected by the
      // `AuthSessionProvider`), instead of this import.
    }
    // 4. Send request, which the end of the session of the account cancels
    const request = trackSignedRequest(id, init?.signal);
    try {
      return await _platformFetch(input, {
        ...init,
        headers: {
          ...getAuthenticationHeaderForAccount(current()),
          ...init?.headers,
        },
        signal: request.signal,
      });
    } catch (e) {
      if (e instanceof FetchError && e.code === FetchErrorCode.ABORTED && request.endedBySession())
        throw new FetchError(FetchErrorCode.SESSION_ENDED, undefined, { cause: e });
      throw e;
    } finally {
      request.done();
    }
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
