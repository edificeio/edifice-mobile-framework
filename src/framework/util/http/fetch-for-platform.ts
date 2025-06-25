import { parseFetchArguments } from './fetch';
import { _fetch, _parseJson, RequestBuilder } from './request-builder';

import { Platform } from '~/framework/util/appConf';

export async function fetchForPlatform(platform: Platform, url: string | URL, init?: RequestInit): Promise<Response>;
export async function fetchForPlatform(
  platform: Platform,
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForPlatform(
  platform: Platform,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response>;
export async function fetchForPlatform(
  platform: Platform,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<Response> {
  const request = new RequestBuilder(...parseFetchArguments(methodOrUrl, urlOrInit, init)).withPlatform(platform).build();
  console.info('[HTTP] Fetch for platform :', platform.displayName, request.method, request.url, JSON.stringify(request));
  return await _fetch(request);
}

export async function fetchJsonForPlatform<ResponseType>(
  platform: Platform,
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJsonForPlatform<ResponseType>(
  platform: Platform,
  method: Request['method'],
  url: string | URL,
  init?: RequestInit,
): Promise<ResponseType>;
export async function fetchJsonForPlatform<ResponseType>(
  platform: Platform,
  methodOrUrl: Request['method'] | string | URL,
  urlOrInit?: string | URL | RequestInit,
  init?: RequestInit,
): Promise<ResponseType> {
  return fetchForPlatform(platform, methodOrUrl, urlOrInit, init).then(_parseJson) as Promise<ResponseType>;
}
