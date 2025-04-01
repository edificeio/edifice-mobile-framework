import { _fetch, _parseJson, RequestBuilder } from './request-builder';

/**
 * Parses the arguments provided to a http fetch method of this module and returns them in a standardized format for RequestBuilder class.
 *
 * @param methodOrUrl - The HTTP method or URL. If only one argument is provided, it is assumed to be the URL.
 * @param urlOrInit - The URL or RequestInit object. If this is a string or URL, it is assumed to be the URL.
 * @param init - The RequestInit object containing any custom settings for the request.
 * @returns A tuple containing the HTTP method, URL, and RequestInit object, compatible with the RequestBuilder constructor.
 */
export function parseFetchArguments(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
) {
  let _method: Request['method'] | undefined = RequestBuilder.defaultMethod;
  let _url: string | URL;
  let _init: RequestInit | undefined;

  /**
   * There is 4 usages for this method :
   * Case 1 : url + undefined + undefined
   * Case 2 : method + url + undefined
   * Case 3 : url + init + undefined
   * Case 4 : method + url + init
   */

  if (urlOrInit === undefined) {
    // Case 1
    _url = methodOrUrl;
    _init = undefined;
  } else if (init === undefined) {
    // Case 2 or 3
    if (typeof urlOrInit === 'string' || urlOrInit instanceof URL) {
      // Case 2
      _method = methodOrUrl as Request['method'];
      _url = urlOrInit;
      _init = undefined;
    } else {
      // Case 3
      _url = methodOrUrl;
      _init = urlOrInit;
    }
  } else {
    // Case 4
    _method = methodOrUrl as Request['method'];
    _url = urlOrInit as string | URL;
    _init = init;
  }

  return [_method, _url, _init] as const;
}

/**
 * Send a fetch request using the specified HTTP method and URL.
 * Caution: This function does not automatically inject hostname or authorization headers.
 *          Please use `signedFetchForAccount` or `signedFetch` for that.
 *
 * @param method - The HTTP method to use for the request. Defaults to the default method of `RequestBuilder`.
 * @param url - The URL of the resource to fetch. Can be a string or a `URL` object.
 * @param init - Optional configuration options for the request.
 * @returns A promise that resolves to the `Response` object representing the response to the request.
 * @throws Will throw an HTTP or Network error if the fetch operation fails.
 */
export async function fetch(url: string | URL, init?: RequestInit): Promise<Response>;
export async function fetch(method: Request['method'], url: string | URL, init?: RequestInit): Promise<Response>;
export async function fetch(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response>;
export async function fetch(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response> {
  const request = new RequestBuilder(...parseFetchArguments(methodOrUrl, urlOrInit, init)).build();
  console.debug('[HTTP] Fetch :', request.method, request.url, JSON.stringify(request));
  return _fetch(request);
}

export async function fetchJson<ResponseType>(url: string | URL, init?: RequestInit): Promise<ResponseType>;
export async function fetchJson<ResponseType>(
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJson<ResponseType>(
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<ResponseType> {
  return fetch(methodOrUrl, urlOrInit, init).then(_parseJson) as Promise<ResponseType>;
}
