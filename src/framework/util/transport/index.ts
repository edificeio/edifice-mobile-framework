/**
 * Transport fetch Client
 *
 * Expose fatch functions to make api calls from mobileapp
 *
 * # Features :
 *
 * - 30s timeout
 * - Mobile default headers ("x-app", "x-app-name", "x-app-version" and "x-device-id")
 * - Baseurl handling from Platform information
 * - HTTPError & FetchError handling
 * - Automatic Authentification & refresh token if necessary
 * - Compatible `fetch` and Edifice API Consumers
 *
 * # USAGE
 *
 * ## Fetch functions
 *
 * ### Non-signed fetch with absolute URLs only. Use exactify as the native `fetch` function.
 * deviceFetch(info, init) => Promise<Response>
 * deviceFetch.text(info, init) => Promise<string>
 * deviceFetch.json<ResponseBody>(info, init) => Promise<ResponseBody>
 *
 * ### Non-signed fetch with relative URLs.
 * platformFetch(platform, info, init) => Promise<Response>
 * platformFetch.text(platform, info, init) => Promise<string>
 * platformFetch.json<ResponseBody>(platform, info, init) => Promise<ResponseBody>
 *
 * ### Signed fetch for given account, with relative URLs.
 * accountFetch(account, info, init) => Promise<Response>
 * accountFetch.text(account, info, init) => Promise<string>
 * accountFetch.json<ResponseBody>(account, info, init) => Promise<ResponseBody>
 *
 * ### Signed fetch for current account, with relative URLs.
 * sessionFetch(info, init) => Promise<Response>
 * sessionFetch.text(info, init) => Promise<string>
 * sessionFetch.json<ResponseBody>(info, init) => Promise<ResponseBody>
 *
 * ## Api consumer factories
 *
 * ### Intanciate given clientApi with `accountFetch` features.
 * accountApi(moduleConfig, account, clientApi) => InstanceType<typeof clientApi>
 *
 * ### Intanciate given clientApi with `sessionFetch` features.
 * sessionApi(moduleConfig, clientApi) => InstanceType<typeof clientApi>
 *
 * ## Observations
 *
 * Note: Prefer `accountApi` or `accountFetch` over `sessionApi` or `sessionFetch` in screens that uses the `sessionScreen` HOC (pass the session received as prop).
 *
 */

export { accountApi, sessionApi } from './api';
export { accountFetch, deviceFetch, platformFetch, sessionFetch } from './fetch';

