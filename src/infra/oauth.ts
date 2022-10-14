/**
 * OAuth2 client for Ressource Owner Password Grant type flow.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as btoa } from 'base-64';
import querystring from 'querystring';
import { ImageURISource } from 'react-native';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
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

export enum OAuthErrorType {
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
  type: OAuthErrorType;
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

export class OAuth2RessourceOwnerPasswordClient {
  /**
   * Common headers to all oauth2 flow requets
   */
  private static DEFAULT_HEADERS = {
    // tslint:disable-next-line:prettier
    Accept: 'application/json, application/x-www-form-urlencoded',
    'Content-Type': 'application/x-www-form-urlencoded',
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
    type: OAuthErrorType,
    error: string,
    description?: string,
    additionalData?: T,
  ): OAuthError & T;
  public createAuthError<T extends object>(
    bodyOrType: { error: string; error_description?: string } | OAuthErrorType,
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
        err.type = OAuthErrorType.INVALID_CLIENT;
      } else if (bodyOrType.error === 'invalid_grant') {
        err.type = OAuthErrorType.INVALID_GRANT;
      } else if (bodyOrType.error === 'access_denied') {
        if (bodyOrType.error_description === 'auth.error.authenticationFailed') {
          err.type = OAuthErrorType.BAD_CREDENTIALS;
        } else if (bodyOrType.error_description === 'auth.error.blockedUser') {
          err.type = OAuthErrorType.BLOCKED_USER;
        } else if (bodyOrType.error_description === 'auth.error.blockedProfileType') {
          err.type = OAuthErrorType.BLOCKED_TYPE;
        } else if (bodyOrType.error_description === 'auth.error.global') {
          err.type = OAuthErrorType.PLATFORM_UNAVAILABLE;
        } else if (bodyOrType.error_description === 'auth.error.ban') {
          err.type = OAuthErrorType.TOO_MANY_TRIES;
        } else {
          err.type = OAuthErrorType.UNKNOWN_DENIED;
        }
      } else if (bodyOrType.error === 'quota_overflow') {
        err.type = OAuthErrorType.TOO_LOAD;
      } else {
        err.type = OAuthErrorType.UNKNOWN_RESPONSE;
      }
    } else if (bodyOrType && typeof bodyOrType === 'object' && error) {
      // create from type
      err.type = bodyOrType as unknown as OAuthErrorType;
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
      err.type = OAuthErrorType.UNKNOWN_RESPONSE;
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
      if (err instanceof Error) (err as OAuthError).type = OAuthErrorType.NETWORK_ERROR;
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
      if (err instanceof Error) (err as OAuthError).type = OAuthErrorType.PARSE_ERROR;
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
      throw this.createAuthError(OAuthErrorType.NOT_INITIALIZED, 'no client info provided');
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
        throw this.createAuthError(OAuthErrorType.BAD_RESPONSE, 'no access_token returned', '', { data });
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
      error.name = '[oAuth] getToken failed: ' + error.name;
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

  /**
   * Read stored token in local storage. No-op if no token is stored, return undefined.
   */
  public async loadToken(): Promise<IOAuthToken | undefined> {
    try {
      const rawStoredToken = await AsyncStorage.getItem('token');
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
      throw this.createAuthError(OAuthErrorType.NOT_INITIALIZED, 'no client info provided');
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
        throw this.createAuthError(OAuthErrorType.BAD_RESPONSE, 'no access_token returned', '', { data });
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
        const url = `${DEPRECATED_getCurrentPlatform()!.url}/auth/oauth2/token?type=queryparam`;
        const data = await this.request(url, {
          headers: getAuthHeader(),
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

/**
 * Transforms a source to ensure it can be used.
 * @param src
 */
export function transformedSrc(src: string) {
  if (!src) return src;
  return src.startsWith('//') ? `https:${src}` : src.startsWith('/') ? `${DEPRECATED_getCurrentPlatform()!.url}${src}` : src;
}

/**
 * Returns if the given url need to be signed.
 * An url must be signed if it point to the current platform.
 * If the url contains a protocol identifier, it noot be signed.
 * @param absoluteUrl
 */
export function getIsUrlSignable(absoluteUrl: string): boolean {
  return absoluteUrl.indexOf('://') === -1 || absoluteUrl.indexOf(DEPRECATED_getCurrentPlatform()!.url) !== -1;
}

/**
 * Returns an empty signed request, just to get the authorisation header.
 */
export function getDummySignedRequest() {
  if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] getDummySignedRequest: no token');
  return OAuth2RessourceOwnerPasswordClient.connection.signRequest('<dummy request>');
}
/**
 * Returns an headers object containing only the authorisation header.
 */
export function getAuthHeader(): { Authorization: string } {
  const ret = { Authorization: getDummySignedRequest().headers.get('Authorization') };
  if (!ret.Authorization) throw new Error('[oAuth] getAuthHeader: empty auth header');
  return ret as { Authorization: string };
}

/**
 * Returns a signed request from an url or a request
 */
export function signRequest(requestInfo: RequestInfo): RequestInfo {
  if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] signRequest: no token');

  if (requestInfo instanceof Request) {
    return getIsUrlSignable(requestInfo.url) ? OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo) : requestInfo;
  } else {
    /* requestInfo is string */
    return getIsUrlSignable(requestInfo) ? OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo) : requestInfo;
  }
}

/**
 * Returns a signed URISource from a url or an imageURISource.
 */
export function signURISource(URISource: ImageURISource | string): ImageURISource {
  if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] signURISource: no token');

  if (typeof URISource === 'object') {
    if (!URISource.uri) throw new Error('[oAuth] signURISource: no uri');
    if (getIsUrlSignable(URISource.uri)) {
      return { ...URISource, headers: { ...URISource.headers, ...getAuthHeader() } };
    } else {
      return URISource;
    }
  } else {
    /* URISource is string */
    if (getIsUrlSignable(URISource)) {
      return { uri: URISource, headers: getAuthHeader() };
    } else {
      return { uri: URISource };
    }
  }
}

/**
 * Returns a signed URISource from a url or an imageURISource for all items in the given array.
 * @param images
 */
export function signURISourceArray(
  URISources: { src: ImageURISource | string; alt: string }[],
): { src: ImageURISource | string; alt: string }[] {
  return URISources.map(URISource => ({ ...URISource, src: signURISource(URISource.src) }));
}

// ============ DEPRECATED SECTION ============= //

/**
 * Returns a image array with signed url requests.
 */
export function DEPRECATED_signImagesUrls(images: { src: string; alt: string }[]): { src: ImageURISource; alt: string }[] {
  return images.map(v => ({
    ...v,
    src: DEPRECATED_signImageURISource(v.src),
  }));
}

/**
 * Build a signed request from an url.
 * This function skip the signing if url points to an another web domain.
 */
export function DEPRECATED_signImageURISource(url: string): ImageURISource {
  if (!OAuth2RessourceOwnerPasswordClient.connection) throw new Error('[oAuth] signUrl: no token');
  // If there is a protocol AND url doen't contain plateform url, doesn't sign it.
  if (url.indexOf('://') !== -1 && url.indexOf(DEPRECATED_getCurrentPlatform()!.url) === -1) {
    return { uri: url };
  }
  return {
    method: 'GET',
    uri: url,
    headers: getAuthHeader(),
  };
}
