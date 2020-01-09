/**
 * OAuth2 client for Ressource Owner Password Grant type flow.
 */

import { encode as btoa } from "base-64";
import querystring from "querystring";
import { AsyncStorage, ImageURISource } from "react-native";
import Conf from "../../ode-framework-conf";

export interface IOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
  refresh_token: string;
  scope: string;
}

export enum OAuthErrorType {
  // Response errors
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  BAD_CREDENTIALS = 'bad_credentials',
  BLOCKED_USER = 'blocked_user',
  PLATFORM_UNAVAILABLE = 'platform_unavailable',
  TOO_LOAD = 'too_load',
  UNKNOWN_DENIED = 'unknown_denied',
  UNKNOWN_RESPONSE = 'unknown_response',
  // Non-response errors
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error',
  BAD_RESPONSE = 'bad_response',
  // Not initialized
  NOT_INITIALIZED = 'not_initilized'
}
export interface OAuthErrorDetails {
  type: OAuthErrorType,
  error?: string;
  description?: string;
}
export type OAuthError = Error & OAuthErrorDetails;

export const sanitizeScope = (scopes: string[]) =>
  Array.isArray(scopes) ? scopes.join(" ").trim() : scopes || "";

export class OAuthClientInfo {
  clientId: string;
  clientSecret: string;
  scope: string[];

  constructor(clientId: string, clientSecret: string, scope: string[]) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  get scopeString(): string { return sanitizeScope(this.scope); }
}

export class OAuth2RessourceOwnerPasswordClient {
  /**
   * Common headers to all oauth2 flow requets
   */
  private static DEFAULT_HEADERS = {
    // tslint:disable-next-line:prettier
    Accept: "application/json, application/x-www-form-urlencoded",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  /**
   * Current active oauth connection.
   */
  public static connection: OAuth2RessourceOwnerPasswordClient | null = null;

  private token: IOAuthToken | null = null; // Current active token information
  private clientInfo: OAuthClientInfo | null = null; // Current connected client information
  private accessTokenUri: string = ""; // Uri to get or refresh the token

  /**
   * Inialize a oAuth connection. DOES NOT get token.
   * NOTE : This module offers a global instance of this class that is configured to work with ODE's backend API.
   * Use it only to create a new connection.
   * @param accessTokenUri URL where to get oAuth tokens
   * @param clientId
   * @param clientSecret
   * @param scope Array of scopes names. Will be automatically flattened into a string, don't worry about that.
   */
  public constructor(
    accessTokenUri: string,
    clientId: string,
    clientSecret: string,
    scope: string[]
  ) {
    this.accessTokenUri = accessTokenUri;
    this.clientInfo = new OAuthClientInfo(clientId, clientSecret, scope);
  }

  /**
   * Create a throwable authentication error object from the JSON response data or from custom data.
   * Use this returns always an error.
   * @param data
   */
  private createAuthError(body: { error: string, error_description?: string }): OAuthError;
  private createAuthError<T extends object>(type: OAuthErrorType, error: string, description?: string, additionalData?: T): OAuthError & T;
  private createAuthError<T extends object>(bodyOrType: { error: string, error_description?: string } | OAuthErrorType, error?: string, description?: string, additionalData?: T): OAuthError & T {
    let err: OAuthError = new Error("EAUTH: returned error") as any;
    err.name = "EAUTH";
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
        } else if (bodyOrType.error_description === 'auth.error.global') {
          err.type = OAuthErrorType.PLATFORM_UNAVAILABLE;
        } else {
          err.type = OAuthErrorType.UNKNOWN_DENIED;
        }
      } else if (bodyOrType.error === 'quota_overflow') {
        err.type = OAuthErrorType.TOO_LOAD;
      }else {
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
      const err: OAuthError = new Error("EAUTH: invalid Json oauth response") as any;
      err.name = 'EAUTH';
      err.type = OAuthErrorType.UNKNOWN_RESPONSE;
      err.description = "Body is not JSON data."
      throw new Error("EAUTH: invalid Json oauth response");
    }
  }

  /**
   * Create basic auth header.
   */
  private createAuthHeader(clientId: string, clientSecret: string): string {
    return "Basic " + btoa(clientId || "" + ":" + clientSecret || "");
  }

  /**
   * Sign a standardised request object with user authentication information.
   * To use with the standard fetch API, call `fetch(url, sign(init))`.
   */
  public signRequest(requestInfo: RequestInfo, init?: RequestInit) {
    if (!this.hasToken) {
      throw new Error("EAUTH: Unable to sign request without active access token.");
    }
    if (this.token!.token_type.toLowerCase() === 'bearer') {
      // console.log("token:", this.token.access_token);
      const req = new Request(requestInfo, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: "Bearer " + this.token!.access_token
        }
      });
      return req;
    } else {
      throw new Error("EAUTH: Only Bearer token type supported. Given " + this.token!.token_type);
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
      url += (url.indexOf("?") === -1 ? "?" : "&") + query;
    }
    // 2: Send request
    let response: Response;
    try {
      response = await fetch(url, {
        body,
        headers: options.headers,
        method: options.method
      });
    } catch (err) {
      if (err instanceof Error)
        (err as OAuthError).type = OAuthErrorType.NETWORK_ERROR;
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
      if (err instanceof Error)
        (err as OAuthError).type = OAuthErrorType.PARSE_ERROR;
      throw err;
    }
    // 5: Check if response is error
    // console.log("[OAuth] data:", data);
    if (data?.error) {
      throw this.createAuthError(data);
    }
    // 6: OK
    return data;
  }

  /**
   * Get a fresh new access token with owner credentials
   */
  public async getNewToken(
    username: string,
    password: string,
    saveToken: boolean = true
  ): Promise<IOAuthToken> {
    if (!this.clientInfo) {
      throw this.createAuthError(OAuthErrorType.NOT_INITIALIZED, 'no client info provided');
    }
    // 1: Build request
    const body = {
      client_id: this.clientInfo.clientId,
      client_secret: this.clientInfo.clientSecret,
      grant_type: "password",
      scope: this.clientInfo.scopeString,
      username,
      password,
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.createAuthHeader(this.clientInfo.clientId, this.clientInfo.clientSecret)
    };

    try {
      // 2: Call oAuth API
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      // 3: Build token from data
      if (!data.hasOwnProperty('access_token')) {
        throw this.createAuthError(OAuthErrorType.BAD_RESPONSE, 'no access_token returned', '', {data});
      }
      this.token = {
        ...data,
        expires_at: OAuth2RessourceOwnerPasswordClient.getExpirationDate(data.expires_in)
      };
      // 4: Save token if asked
      saveToken && await this.saveToken();
      return this.token!;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("Get token failed: ", err);
      (err as Error).name = "[oAuth] getToken failed: " + err.name;
      throw err;
    }
  }

  /**
   * Read stored token in local storage. No-op if no token is stored, return undefined.
   */
  public async loadToken(): Promise<IOAuthToken | undefined> {
    try {
      const rawStoredToken = await AsyncStorage.getItem("token");
      if (!rawStoredToken) {
        return undefined;
      }
      const storedToken = JSON.parse(rawStoredToken);
      if (!storedToken) {
        const err = new Error("[oAuth] loadToken: Unable to parse stored token");
        throw err;
      }
      this.token = {
        ...storedToken,
        expires_at: new Date(storedToken.expires_at)
      };
      return this.token!;
    } catch (err) {
      console.warn("[oAuth] loadToken: ", err);
      throw err;
    }
  }

  /**
   * Saves given token information in local storage.
   */
  public async saveToken() {
    try {
      await AsyncStorage.setItem("token", JSON.stringify(this.token));
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("[oAuth] saveToken: ", err);
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
    if (!this.token || !this.token.refresh_token)
      throw new Error("[oAuth] refreshToken: No refresh token provided.");

    // 1: Build request
    const body = {
      client_id: this.clientInfo.clientId,
      client_secret: this.clientInfo.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.token.refresh_token,
      scope: this.clientInfo.scopeString
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.createAuthHeader(this.clientInfo.clientId, this.clientInfo.clientSecret)
    };

    try {
      // 2: Call oAuth API to the get the new token
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      if (!data.hasOwnProperty('access_token')) {
        throw this.createAuthError(OAuthErrorType.BAD_RESPONSE, 'no access_token returned', '', { data });
      }
      // 3: Construct the token with received data
      this.token = {
        ...this.token,
        ...data,
        expires_at: OAuth2RessourceOwnerPasswordClient.getExpirationDate(data.expires_in)
      };
      // Save token
      await this.saveToken();
      return this.token!;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("[oAuth] refreshToken: ", err);
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
      await AsyncStorage.removeItem("token");
      this.token = null;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("[oAuth] eraseToken: ", err);
      throw err;
    }
  }
}

/**
 * Scopes needed for the application.
 */
export const scopes = `
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
`.split("\n "); // Here the space after "\n" is important, they represent the indentation & the space between the words when "\n" is removed.
// You can copy the string directly in the "scope" field in a browser. Keep this indentation intact.

/**
 * Returns if the given url need to be signed.
 * An url must be signed if it point to the current platform.
 * If the url contains a protocol identifier, it noot be signed.
 * @param absoluteUrl
 */
export function getIsUrlSignable(absoluteUrl: string): boolean {
  return (
    absoluteUrl.indexOf("://") === -1 ||
    absoluteUrl.indexOf((Conf.currentPlatform as any).url) !== -1
  );
}

/**
 * Returns an empty signed request, just to get the authorisation header.
 */
export function getDummySignedRequest() {
  if (!OAuth2RessourceOwnerPasswordClient.connection)
    throw new Error('[oAuth] getDummySignedRequest: no token');
  return OAuth2RessourceOwnerPasswordClient.connection.signRequest('<dummy request>');
}
/**
 * Returns an headers object containing only the authorisation header.
 */
export function getAuthHeader(): { Authorization : string } {
  const ret = { Authorization: getDummySignedRequest().headers.get('Authorization') };
  if (!ret.Authorization) throw new Error("[oAuth] getAuthHeader: empty auth header");
  return ret as { Authorization: string };
}

/**
 * Returns a signed request from an url or a request
 */
export function signRequest(requestInfo: RequestInfo): RequestInfo {
  if (!OAuth2RessourceOwnerPasswordClient.connection)
    throw new Error('[oAuth] signRequest: no token');

  if (requestInfo instanceof Request) {
    return getIsUrlSignable(requestInfo.url) ?
      OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo) :
      requestInfo;
  } else { /* requestInfo is string */
    return getIsUrlSignable(requestInfo) ?
      OAuth2RessourceOwnerPasswordClient.connection.signRequest(requestInfo) :
      requestInfo;
  }
}

/**
 * Returns a signed imageURISource from an url or an imageURISource
 */
export function signImageURISource(imageURISource: ImageURISource | string): ImageURISource | string {
  if (!OAuth2RessourceOwnerPasswordClient.connection)
    throw new Error('[oAuth] signImageURISource: no token');

  if (typeof imageURISource === 'object') {
    if (!imageURISource.uri) throw new Error('[oAuth] signImageURISource: no uri');
    if (getIsUrlSignable(imageURISource.uri)) {
      return {...imageURISource, headers: {...imageURISource.headers, ...getAuthHeader()}};
    } else {
      return imageURISource;
    }
  }
  else { /* imageURISource is string */
    if (getIsUrlSignable(imageURISource)) {
      return { uri: imageURISource, headers: getAuthHeader() };
    } else {
      return imageURISource;
    }
  }
}

/**
 * Returns a signed imageURISource from an url or an imageURISource for all images in the given array.
 * @param images
 */
export function signImageURISourceArray(images: Array<{ src: ImageURISource | string; alt: string }>): Array<{ src: ImageURISource | string; alt: string }> {
  return images.map(
    im => ({ ...im, src: signImageURISource(im.src) })
  );
}

// ============ DEPRECATED SECTION ============= //

/**
 * Returns a image array with signed url requests.
 */
export function DEPRECATED_signImagesUrls(
  images: Array<{ src: string; alt: string }>
): Array<{ src: ImageURISource; alt: string }> {
  return images.map(v => ({
    ...v,
    src: DEPRECATED_signImageURISource(v.src)
  }));
}

/**
 * Build a signed request from an url.
 * This function skip the signing if url points to an another web domain.
 */
export function DEPRECATED_signImageURISource(url: string): ImageURISource {
  if (!OAuth2RessourceOwnerPasswordClient.connection)
    throw new Error('[oAuth] signUrl: no token')
  // console.log(url);
  // If there is a protocol AND url doen't contain plateform url, doesn't sign it.
  if (
    url.indexOf("://") !== -1 &&
    url.indexOf((Conf.currentPlatform as any).url) === -1
  ) {
    // console.log("external image, not sign");
    return { uri: url };
  }
  // console.log("internal, signed");
  return {
    method: 'GET',
    uri: url,
    headers: getAuthHeader()
  }
}

