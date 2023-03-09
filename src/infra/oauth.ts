/**
 * OAuth2 client for Ressource Owner Password Grant type flow.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as btoa } from 'base-64';
import querystring from 'querystring';
import { ImageRequireSource, ImageURISource } from 'react-native';
import { Source } from 'react-native-fast-image';

import { assertSession } from '~/framework/modules/auth/reducer';
import { Platform } from '~/framework/util/appConf';
import { ModuleArray } from '~/framework/util/moduleTool';
import { getItemJson, removeItemJson, setItemJson } from '~/framework/util/storage';

// This is a big hack to prevent circular dependencies. AllModules.tsx must not included from modules theirself.
export const AllModulesBackup = {
  value: undefined,
} as {
  value?: ModuleArray;
};

export interface IOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
  refresh_token: string;
  scope: string;
}

export interface IOAuthCustomToken {
  structureName: string;
  key: string;
}

export interface IOAuthQueryParamToken {
  token_type: 'QueryParam';
  access_token: string;
  expires_in: number;
  expires_at: Date;
}

export type OAuthCustomTokens = IOAuthCustomToken[];

export enum OAuth2ErrorCode {
  // Response errors
  BAD_CREDENTIALS = 'bad_credentials',
  BAD_SAML = 'bad_saml',
  BLOCKED_TYPE = 'blocked_type',
  BLOCKED_USER = 'blocked_user',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  MULTIPLE_VECTOR = 'multiple_vector_choice',
  PLATFORM_UNAVAILABLE = 'platform_unavailable',
  TOO_LOAD = 'too_load',
  TOO_MANY_TRIES = 'too_many_tries',
  UNKNOWN_DENIED = 'unknown_denied',
  UNKNOWN_RESPONSE = 'unknown_response',
  // Non-response errors
  BAD_RESPONSE = 'bad_response',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error',
  // Not initialized
  NOT_INITIALIZED = 'not_initilized',
}

export interface OAuthErrorDetails {
  type: OAuth2ErrorCode;
  error?: string;
  description?: string;
}

export type OAuthError = Error & OAuthErrorDetails;

export const sanitizeScope = (scopes: string[]) => (Array.isArray(scopes) ? scopes.join(' ').trim() : scopes || '');

export class OAuthClientInfo {
  clientId: string;
  clientSecret: string;
  scope: string[];

  constructor(clientId: string, clientSecret: string, scope: string[]) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  get scopeString(): string {
    return sanitizeScope(this.scope);
  }
}

export const uniqueId = () => {
  try {
    return assertSession()?.user?.uniqueId ?? '';
  } catch {
    return '';
  }
};

export class OAuth2RessourceOwnerPasswordClient {
  /**
   * Common headers to all oauth2 flow requets
   */
  private static DEFAULT_HEADERS = {
    // tslint:disable-next-line:prettier
    Accept: 'application/json, application/x-www-form-urlencoded',
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Device-Id': uniqueId,
  };

  /**
   * Current active oauth connection.
   */
  public static connection: OAuth2RessourceOwnerPasswordClient | null = null;

  private token: IOAuthToken | null = null; // Current active token information
  private clientInfo: OAuthClientInfo | null = null; // Current connected client information
  private accessTokenUri: string = ''; // Uri to get or refresh the token
  private uniqueSessionIdentifier: string | undefined;

  /**
   * Inialize a oAuth connection. DOES NOT get token.
   * NOTE : This module offers a global instance of this class that is configured to work with ODE's backend API.
   * Use it only to create a new connection.
   * @param accessTokenUri URL where to get oAuth tokens
   * @param clientId
   * @param clientSecret
   * @param scope Array of scopes names. Will be automatically flattened into a string, don't worry about that.
   */
  public constructor(accessTokenUri: string, clientId: string, clientSecret: string, scope: string[]) {
    this.accessTokenUri = accessTokenUri;
    this.clientInfo = new OAuthClientInfo(clientId, clientSecret, scope);
  }

  /**
   * Create a throwable authentication error object from the JSON response data or from custom data.
   * Use this returns always an error.
   * @param data
   */
  public createAuthError(body: { error: string; error_description?: string }): OAuthError;
  public createAuthError<T extends object>(
    type: OAuth2ErrorCode,
    error: string,
    description?: string,
    additionalData?: T,
  ): OAuthError & T;
  public createAuthError<T extends object>(
    bodyOrType: { error: string; error_description?: string } | OAuth2ErrorCode,
    error?: string,
    description?: string,
    additionalData?: T,
  ): OAuthError & T {
    const err: OAuthError = new Error('EAUTH: returned error') as any;
    err.name = 'EAUTH';
    if (bodyOrType && typeof bodyOrType === 'object' && bodyOrType.hasOwnProperty('error')) {
      // create from body
      Object.assign(err, bodyOrType);
      if (bodyOrType.error === 'invalid_client') {
        err.type = OAuth2ErrorCode.INVALID_CLIENT;
      } else if (bodyOrType.error === 'invalid_grant') {
        err.type = OAuth2ErrorCode.INVALID_GRANT;
      } else if (bodyOrType.error === 'access_denied') {
        if (bodyOrType.error_description === 'auth.error.authenticationFailed') {
          err.type = OAuth2ErrorCode.BAD_CREDENTIALS;
        } else if (bodyOrType.error_description === 'auth.error.blockedUser') {
          err.type = OAuth2ErrorCode.BLOCKED_USER;
        } else if (bodyOrType.error_description === 'auth.error.blockedProfileType') {
          err.type = OAuth2ErrorCode.BLOCKED_TYPE;
        } else if (bodyOrType.error_description === 'auth.error.global') {
          err.type = OAuth2ErrorCode.PLATFORM_UNAVAILABLE;
        } else if (bodyOrType.error_description === 'auth.error.ban') {
          err.type = OAuth2ErrorCode.TOO_MANY_TRIES;
        } else {
          err.type = OAuth2ErrorCode.UNKNOWN_DENIED;
        }
      } else if (bodyOrType.error === 'quota_overflow') {
        err.type = OAuth2ErrorCode.TOO_LOAD;
      } else {
        err.type = OAuth2ErrorCode.UNKNOWN_RESPONSE;
      }
    } else if (bodyOrType && typeof bodyOrType === 'object' && error) {
      // create from type
      err.type = bodyOrType as unknown as OAuth2ErrorCode;
      err.error = error;
      err.description = description;
      additionalData && Object.assign(err, additionalData);
    } else {
      throw new Error(`[getAuthError] Bad parameter: ${bodyOrType}`);
    }
    return err as OAuthError & T;
  }

  /**
   * Attempt to parse response body as JSON, fall back to parsing as a query string.
   *
   * @param body
   */
  private async parseResponseJSON(response: Response) {
    try {
      return await response.json();
    } catch (e) {
      const err: OAuthError = new Error('EAUTH: invalid Json oauth response') as OAuthError;
      err.name = 'EAUTH';
      err.type = OAuth2ErrorCode.UNKNOWN_RESPONSE;
      err.description = 'Body is not JSON data.';
      throw err;
    }
  }

  /**
   * Create basic auth header.
   */
  private createAuthHeader(clientId: string, clientSecret: string): string {
    return 'Basic ' + btoa(clientId || '' + ':' + clientSecret || '');
  }

  /**
   * Sign a standardised request object with user authentication information.
   * To use with the standard fetch API, call `fetch(url, sign(init))`.
   */
  public signRequest(requestInfo: RequestInfo, init?: RequestInit) {
    if (!this.hasToken) {
      throw new Error('EAUTH: Unable to sign request without active access token.');
    }
    if (this.token!.token_type.toLowerCase() === 'bearer') {
      const req = new Request(requestInfo, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: 'Bearer ' + this.token!.access_token,
        },
      });
      return req;
    } else {
      throw new Error('EAUTH: Only Bearer token type supported. Given ' + this.token!.token_type);
    }
  }

  /**
   * Perform a fetch request specially for auth requests.
   * This checks EAUTH and HTTP errors and parses the response as a JSON object.
   * @param url
   * @param options
   */
  private async request(url: string, options: any) {
    // 1: Initialize request
    const body = querystring.stringify(options.body);
    const query = querystring.stringify(options.query);
    if (query) {
      // 1.1: Append url query with the given one
      url += (url.indexOf('?') === -1 ? '?' : '&') + query;
    }
    // 2: Send request
    let response: Response;
    try {
      response = await fetch(url, {
        body,
        headers: options.headers,
        method: options.method,
      });
    } catch (err) {
      if (err instanceof Error) (err as OAuthError).type = OAuth2ErrorCode.NETWORK_ERROR;
      throw err;
    }
    // 3: Check HTTP Status
    if (!response.ok) {
      const errdata = await this.parseResponseJSON(response);
      throw this.createAuthError(errdata);
    }
    // 4: Parse reponse
    let data: any;
    try {
      data = await this.parseResponseJSON(response);
    } catch (err) {
      if (err instanceof Error) (err as OAuthError).type = OAuth2ErrorCode.PARSE_ERROR;
      throw err;
    }
    // 5: Check if response is error
    if (data?.error) {
      throw this.createAuthError(data);
    }
    // 6: OK
    return data;
  }

  /**
   * Get a fresh new access token with given grant  type and body parameters
   */
  private async getNewToken(grantType: string, parms: any, saveToken: boolean = true): Promise<IOAuthToken> {
    if (!this.clientInfo) {
      throw this.createAuthError(OAuth2ErrorCode.NOT_INITIALIZED, 'no client info provided');
    }
    // 1: Build request
    const body = {
      ...parms,
      client_id: this.clientInfo.clientId,
      client_secret: this.clientInfo.clientSecret,
      grant_type: grantType,
      scope: this.clientInfo.scopeString,
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.createAuthHeader(this.clientInfo.clientId, this.clientInfo.clientSecret),
    };
    try {
      // 2: Call oAuth API
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: 'POST',
      });
      // 3: Build token from data
      if (!data.hasOwnProperty('access_token')) {
        throw this.createAuthError(OAuth2ErrorCode.BAD_RESPONSE, 'no access_token returned', '', { data });
      }
      this.token = {
        ...data,
        expires_at: OAuth2RessourceOwnerPasswordClient.getExpirationDate(data.expires_in),
      };
      // 4: Save token if asked
      saveToken && (await this.saveToken());
      await this.deleteQueryParamToken(); // Delete current queryParamToken here to ensure we'll not have previous one form another accounts.
      this.generateUniqueSesionIdentifier();
      return this.token!;
    } catch (err) {
      const error = err as Error;
      error.message = '[oAuth] getToken failed: ' + error.message;
      throw error;
    }
  }

  /**
   * Get a fresh new access token with custom token
   */
  public async getNewTokenWithCustomToken(token: string, saveToken: boolean = true): Promise<IOAuthToken> {
    return this.getNewToken('custom_token', { custom_token: token }, saveToken);
  }

  /**
   * Get a fresh new access token with SAML Token
   */
  public async getNewTokenWithSAML(saml: string, saveToken: boolean = true): Promise<IOAuthToken | IOAuthCustomToken[]> {
    return this.getNewToken('saml2', { assertion: saml }, saveToken);
  }

  /**
   * Get a fresh new access token with owner credentials
   */
  public async getNewTokenWithUserAndPassword(username: string, password: string, saveToken: boolean = true): Promise<IOAuthToken> {
    return this.getNewToken('password', { username, password }, saveToken);
  }

  public static async getStoredTokenStr(): Promise<string | undefined> {
    const rawStoredToken = await AsyncStorage.getItem('token');
    if (!rawStoredToken) {
      return undefined;
    }
    return rawStoredToken;
  }

  /**
   * Read stored token in local storage. No-op if no token is stored, return undefined.
   */
  public async loadToken(fromData?: string): Promise<IOAuthToken | undefined> {
    try {
      const rawStoredToken = fromData ?? (await OAuth2RessourceOwnerPasswordClient.getStoredTokenStr());
      if (!rawStoredToken) {
        return undefined;
      }
      const storedToken = JSON.parse(rawStoredToken);
      if (!storedToken) {
        const err = new Error('[oAuth] loadToken: Unable to parse stored token');
        throw err;
      }
      this.token = {
        ...storedToken,
        expires_at: new Date(storedToken.expires_at),
      };
      this.generateUniqueSesionIdentifier();
      return this.token!;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Saves given token information in local storage.
   */
  public async saveToken() {
    try {
      await AsyncStorage.setItem('token', JSON.stringify(this.token));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Refresh the user access token.
   */
  public async refreshToken(): Promise<IOAuthToken> {
    if (!this.clientInfo) {
      throw this.createAuthError(OAuth2ErrorCode.NOT_INITIALIZED, 'no client info provided');
    }
    if (!this.token || !this.token.refresh_token) throw new Error('[oAuth] refreshToken: No refresh token provided.');

    // 1: Build request
    const body = {
      client_id: this.clientInfo.clientId,
      client_secret: this.clientInfo.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.token.refresh_token,
      scope: this.clientInfo.scopeString,
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.createAuthHeader(this.clientInfo.clientId, this.clientInfo.clientSecret),
    };

    try {
      // 2: Call oAuth API to the get the new token
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: 'POST',
      });
      if (!data.hasOwnProperty('access_token')) {
        throw this.createAuthError(OAuth2ErrorCode.BAD_RESPONSE, 'no access_token returned', '', { data });
      }
      // 3: Construct the token with received data
      this.token = {
        ...this.token,
        ...data,
        expires_at: OAuth2RessourceOwnerPasswordClient.getExpirationDate(data.expires_in),
      };
      // Save token
      await this.saveToken();
      this.generateUniqueSesionIdentifier();
      return this.token!;
    } catch (err) {
      throw err;
    }
  }

  /**
   * See if access token exists
   */
  get hasToken() {
    return this.token && this.token.access_token;
  }

  /**
   * Is stored token actually expired ?
   */
  public getIsTokenExpired() {
    if (!this.hasToken) throw new Error('[isExpired]: No token');
    return new Date() > this.token!.expires_at;
  }

  /**
   * Returns time before expiring in milliseconds (date.getTime())
   */
  public getTokenExpiresIn() {
    if (!this.hasToken) throw new Error('[expiresIn]: No token');
    return this.token!.expires_at.getTime() - Date.now();
  }

  /**
   * Generates a new expiration date from a number of seconds added to the now Date.
   * @param seconds
   */
  private static getExpirationDate(seconds: number) {
    const expin = new Date();
    expin.setSeconds(expin.getSeconds() + seconds);
    return expin;
  }

  /**
   * Removes the token in this connection.
   * It will be also removed from local storage.
   */
  public async eraseToken() {
    try {
      await AsyncStorage.removeItem('token');
      await this.deleteQueryParamToken();
      this.token = null;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get unique identifier from token (the key is refreshed only when the token is modified).
   */
  public getUniqueSessionIdentifier() {
    return this.uniqueSessionIdentifier || this.generateUniqueSesionIdentifier();
  }
  public generateUniqueSesionIdentifier() {
    this.uniqueSessionIdentifier = Math.random().toString(36).substring(7);
    return this.uniqueSessionIdentifier;
  }

  /**
   * QueryParam token management (for loginless redirection)
   */
  private static QUERY_PARAM_TOKEN_EXPIRATION_DELTA = 60;

  private static QUERY_PARAM_TOKEN_ASYNC_STORAGE_KEY = 'auth.queryParamToken';
  // CAUTION : storage in AsyncStorage is not encrypted.

  public async getQueryParamToken() {
    try {
      const nowDate = new Date();
      // We apply a 60secs margin to the duration of the token to ensure validitiy will not be expired during the process.
      nowDate.setSeconds(nowDate.getSeconds() + OAuth2RessourceOwnerPasswordClient.QUERY_PARAM_TOKEN_EXPIRATION_DELTA);
      let currentQueryParamToken = await getItemJson<IOAuthQueryParamToken>(
        OAuth2RessourceOwnerPasswordClient.QUERY_PARAM_TOKEN_ASYNC_STORAGE_KEY,
      );
      if (!currentQueryParamToken || !currentQueryParamToken.expires_at || nowDate > new Date(currentQueryParamToken.expires_at)) {
        const session = assertSession();
        const url = `${session.platform.url}/auth/oauth2/token?type=queryparam`;
        const data = await this.request(url, {
          headers: urlSigner.getAuthHeader(),
        });
        currentQueryParamToken = {
          ...data,
          expires_at: OAuth2RessourceOwnerPasswordClient.getExpirationDate(data.expires_in),
        };
        await setItemJson(OAuth2RessourceOwnerPasswordClient.QUERY_PARAM_TOKEN_ASYNC_STORAGE_KEY, currentQueryParamToken);
      }
      return currentQueryParamToken?.access_token;
    } catch (e) {
      throw new Error('getQueryParamToken failed: ' + e.toString());
    }
  }

  public async deleteQueryParamToken() {
    await removeItemJson<IOAuthQueryParamToken>(OAuth2RessourceOwnerPasswordClient.QUERY_PARAM_TOKEN_ASYNC_STORAGE_KEY);
  }
}

/**
 * Scopes needed for the application.
 */
export const scopes = `infra
 actualites
 blog
 conversation
 directory
 homeworks
 schoolbook
 timeline
 userinfo
 workspace
 portal
 cas
 sso
 zimbra
 presences
 incidents
 competences
 diary
 viescolaire
 edt
 support`.split('\n '); // Here the space after "\n" is important, they represent the indentation & the space between the words when "\n" is removed.
// You can copy the string directly in the "scope" field in a browser. Keep this indentation intact.
export const createAppScopes = () => {
  return [...AllModulesBackup.value!.getScopes(), 'auth'];
};
export const createAppScopesLegacy = () => [...new Set([...createAppScopes(), ...scopes])];

///////
// URL Signer
// Ensure specified string url is absolute
///////

export const urlSigner = {
  /**
   * Prepend url with domain name if needed.
   * Uses the current platform as domain, but custom platform can be used as a second optional argument.
   */
  getAbsoluteUrl: (url?: string, pf?: Platform) => {
    if (!url) return undefined;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) {
      if (!pf) pf = assertSession().platform;
      return `${pf.url}${url}`;
    }
    return url;
  },

  /**
   * Remove domain, protocol & searchParams from url
   * @param absoluteUrl
   * @returns
   */
  getRelativeUrl: (absoluteUrl?: string) => {
    const pf = assertSession().platform;
    return absoluteUrl && absoluteUrl.replace(pf.url, '').split('?')[0];
  },

  /**
   * Returns if the given url need to be signed.
   * An url must be signed if it point to the current platform.
   * If the url contains a protocol identifier, it not be signed.
   */
  getIsUrlSignable: (absoluteUrl?: string) => {
    const pf = assertSession().platform;
    return absoluteUrl && (absoluteUrl.indexOf('://') === -1 || absoluteUrl.indexOf(pf.url) !== -1);
  },

  /**
   * Returns an empty signed request, just to get the authorisation header.
   * Caution: That request and its properties are read-only.
   */
  getDummySignedRequest: () => {
    if (!OAuth2RessourceOwnerPasswordClient.connection)
      throw new Error('[oAuth2] urlSigner.getDummySignedRequest: no active token');
    return OAuth2RessourceOwnerPasswordClient.connection.signRequest('<dummy request>');
  },

  /**
   * Returns an headers object containing only the authorisation header.
   * Caution: That header is read-only, use its just before sending the requests.
   */
  getAuthHeader: () => {
    const ret = { Authorization: urlSigner.getDummySignedRequest().headers.get('Authorization') };
    if (!ret.Authorization) throw new Error('[oAuth2] urlSigner.getAuthHeader: empty auth header');
    return ret as { Authorization: string };
  },

  /**
   * Returns a signed request from an url or a request
   */
  signRequest: (requestInfo: RequestInfo) => {
    if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] signRequest: no token');

    if (requestInfo instanceof Request) {
      return urlSigner.getIsUrlSignable(requestInfo.url)
        ? OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo)
        : (requestInfo as RequestInfo);
    } else {
      /* requestInfo is string */
      return urlSigner.getIsUrlSignable(requestInfo)
        ? OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo)
        : (requestInfo as RequestInfo);
    }
  },

  /**
   * Returns a signed URISource from a url or an imageURISource.
   */
  signURISource: (
    URISource:
      | (ImageURISource & { isLocal?: boolean })
      | string
      | ImageRequireSource
      | (ImageURISource & { isLocal?: boolean })[]
      | (Source & { isLocal?: boolean })
      | undefined,
  ) => {
    if (URISource === undefined) return URISource;
    if (typeof URISource === 'number') return URISource;
    if (Array.isArray(URISource)) {
      return URISource.map(urlSigner.signURISource);
    }
    if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] signURISource: no token');

    if (typeof URISource === 'object') {
      if (!URISource.uri) throw new Error('[oAuth] signURISource: no uri');
      if (URISource.isLocal) return URISource;
      const absUri = urlSigner.getAbsoluteUrl(URISource.uri)!;
      if (urlSigner.getIsUrlSignable(absUri)) {
        return { ...URISource, uri: absUri, headers: { ...URISource.headers, ...urlSigner.getAuthHeader() } };
      } else {
        return { ...URISource, uri: absUri };
      }
    } else {
      /* URISource is string */
      const absUri = urlSigner.getAbsoluteUrl(URISource);
      if (urlSigner.getIsUrlSignable(absUri)) {
        return { uri: absUri, headers: urlSigner.getAuthHeader() };
      } else {
        return { uri: absUri };
      }
    }
  },

  /**
   * Returns a signed URISource from a url or an imageURISource for all items in the given array.
   * @param images
   */
  signURISourceArray: (URISources: { src: ImageURISource | string }[]) => {
    return URISources.map(URISource => ({ ...URISource, src: urlSigner.signURISource(URISource.src) }));
  },

  getSourceURIAsString(URISource: ImageURISource | string) {
    return typeof URISource === 'string' ? URISource : URISource.uri;
  },
};

export function initOAuth2(platform: Platform) {
  OAuth2RessourceOwnerPasswordClient.connection = new OAuth2RessourceOwnerPasswordClient(
    `${platform.url}/auth/oauth2/token`,
    platform.oauth.client_id,
    platform.oauth.client_secret,
    createAppScopesLegacy(),
  );
}

export function destroyOAuth2() {
  return OAuth2RessourceOwnerPasswordClient.connection?.eraseToken();
}
