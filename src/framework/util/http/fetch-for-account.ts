import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { isTokenExpired, refreshTokenForAccount } from '~/framework/util/oauth2';

import { FetchError, FetchErrorCode } from './error';
import { parseFetchArguments } from './fetch';
import { RequestBuilder, _fetch, _parseJson } from './request-builder';

export async function fetchForAccount(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  url: string | URL,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForAccount(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForAccount(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForAccount(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response> {
  if (isTokenExpired(account.tokens.access)) {
    await refreshTokenForAccount(account);
    // ToDo ? What to do if the refresh token fails?
  }
  const request = new RequestBuilder(...parseFetchArguments(methodOrUrl, urlOrInit, init)).withAccount(account).build();
  console.debug('[HTTP] Fetch for account :', account.user.displayName, request.method, request.url, JSON.stringify(request));
  return await _fetch(request);
}

export async function fetchJsonForAccount<ResponseType>(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJsonForAccount<ResponseType>(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJsonForAccount<ResponseType>(
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<ResponseType> {
  return fetchForAccount(account, methodOrUrl, urlOrInit, init).then(_parseJson) as Promise<ResponseType>;
}

export async function fetchForSession(url: string | URL, init?: RequestInit): Promise<Response>;
export async function fetchForSession(method: Request['method'], url: string | URL, init?: RequestInit): Promise<Response>;
export async function fetchForSession(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForSession(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response> {
  const account = getSession();
  if (!account) {
    throw new FetchError(FetchErrorCode.NOT_LOGGED);
  }
  return fetchForAccount(account, methodOrUrl, urlOrInit, init);
}

export async function fetchJsonForSession<ResponseType>(url: string | URL, init?: RequestInit): Promise<ResponseType>;
export async function fetchJsonForSession<ResponseType>(
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJsonForSession<ResponseType>(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<ResponseType> {
  return fetchForSession(methodOrUrl, urlOrInit, init).then(_parseJson) as Promise<ResponseType>;
}
