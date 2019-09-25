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

export enum OAuthError {
  NO_TOKEN,
  BAD_CREDENTIALS,
  NOT_PREMIUM,
  NETWORK_ERROR
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
  public static connection: OAuth2RessourceOwnerPasswordClient = null;

  // tslint:disable-next-line:variable-name
  private token: IOAuthToken = null;
  private accessTokenUri: string = "";
  private clientId: string = "";
  private clientSecret: string = "";
  private scope: string[] = [];

  /**
   * Inialize a oAuth connection.
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
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
  }

  /**
   * Pull an authentication error from the response data.
   *
   * @param  {Object} data
   * @return {string}
   */
  private getAuthError(body) {
    if (body.error) {
      const err: Error & { body?: any; code?: string } = new Error(body.error);
      err.body = body;
      err.code = "EAUTH";
      return err;
    }
    return null;
  }

  /**
   * Attempt to parse response body as JSON, fall back to parsing as a query string.
   *
   * @param {string} body
   * @return {Object}
   */
  private async parseResponseBody(response: Response) {
    try {
      return await response.json();
    } catch (e) {
      throw new Error("EAUTH: invalid Json oauth response");
    }
  }

  /**
   * Sanitize the scopes option to be a string.
   */
  public sanitizeScope(scopes: string[]): string {
    return Array.isArray(scopes) ? scopes.join(" ").trim() : scopes || "";
  }

  /**
   * Create basic auth header.
   */
  private getAuthHeader(clientId: string, clientSecret: string): string {
    return "Basic " + btoa(clientId || "" + ":" + clientSecret || "");
  }

  /**
   * Sign a standardised request object with user authentication information.
   * To use with the standard fetch API, call `fetch(url, sign(init))`.
   */
  public sign(requestObject) {
    if (!this.token || !this.token.access_token) {
      console.warn("cant't sign", requestObject);
      throw new Error("EAUTH: Unable to sign without access token.");
    }

    requestObject.headers = requestObject.headers || {};
    if (this.token.token_type.toLowerCase() === "bearer") {
      // console.log("token:", this.token.access_token);
      requestObject.headers.Authorization = "Bearer " + this.token.access_token;
    } else {
      throw new Error("EAUTH: Only Bearer token type supported.");
    }
    return requestObject;
  }

  /**
   * Get a fresh new access token with owner credentials
   */
  public async getToken(
    username: string,
    password: string,
    saveToken: boolean = true
  ): Promise<IOAuthToken> {
    // 1: Build request
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "password",
      password,
      scope: this.sanitizeScope(this.scope),
      username
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.getAuthHeader(this.clientId, this.clientSecret)
    };

    try {
      // ("get token oauth ", this.accessTokenUri)
      // 2: Call oAuth API
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      // 3: Build token from data and save it
      this.token = {
        ...data,
        expires_at: this.getExpirationDate(data.expires_in)
      };
      saveToken && await this.saveToken();
      return this.token;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("Get token failed: ", err);
      if (err.body && err.body.error && err.body.error === "invalid_grant") {
        err.authErr = OAuthError.BAD_CREDENTIALS;
      }
      throw err;
    }
  }

  /**
   * Read stored token in local storage.
   */
  public async loadToken() {
    try {
      const storedToken = JSON.parse(await AsyncStorage.getItem("token"));
      if (!storedToken) {
        const err = new Error("EAUTH: No token stored");
        (err as any).authErr = OAuthError.NO_TOKEN;
        throw err;
      }
      this.token = {
        ...storedToken,
        expires_at: new Date(storedToken.expires_at)
      };
    } catch (err) {
      if (err.authErr !== OAuthError.NO_TOKEN)
        // tslint:disable-next-line:no-console
        console.warn("Load token failed: ", err);
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
      console.warn("Saving token failed: ", err);
      throw err;
    }
  }

  /**
   * Refresh the user access token.
   */
  public async refreshToken(): Promise<IOAuthToken> {
    if (!this.token || !this.token.refresh_token)
      throw new Error("EAUTH: No refresh token provided.");

    // 1: Build request
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.token.refresh_token,
      scope: this.sanitizeScope(this.scope)
    };
    const headers = {
      ...OAuth2RessourceOwnerPasswordClient.DEFAULT_HEADERS,
      Authorization: this.getAuthHeader(this.clientId, this.clientSecret)
    };

    try {
      // 2: Call oAuth API to the get the new token
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      // 3: Construct the token with received data
      this.token = {
        ...this.token,
        ...data,
        expires_at: this.getExpirationDate(data.expires_in)
      };
      await this.saveToken();
      return this.token;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.warn("Refreshing token failed: ", err);
      throw err;
    }
  }

  /**
   * Is stored token actually expired ?
   */
  public isExpired() {
    return this.token && new Date() > this.token.expires_at;
  }

  /**
   * Returns time before expiring in milliseconds (date.getTime())
   */
  public expiresIn() {
    return this.token.expires_at.getTime() - Date.now();
  }

  /**
   * Generates a new expiration date from a number of seconds added to the now Date.
   * @param seconds
   */
  private getExpirationDate(seconds: number) {
    const expin = new Date();
    expin.setSeconds(expin.getSeconds() + seconds);
    return expin;
  }

  /**
   * Perform a fetch request specially for auth requests.
   * This checks EAUTH and HTTP errors and parses the response as a JSON object.
   * @param url
   * @param options
   */
  private async request(url: string, options: any) {
    const body = querystring.stringify(options.body);
    const query = querystring.stringify(options.query);
    if (query) {
      // append url query with the given one
      url += (url.indexOf("?") === -1 ? "?" : "&") + query;
    }
    let response;
    try {
      response = await fetch(url, {
        body,
        headers: options.headers,
        method: options.method
      });
    } catch (err) {
      err.authErr = OAuthError.NETWORK_ERROR;
      throw err;
    }
    const data = await this.parseResponseBody(response);
    const authErr = this.getAuthError(data);
    if (authErr) throw authErr;
    if (response.status < 200 || response.status >= 399) {
      const statusErr = new Error("HTTP status " + response.status) as any;
      statusErr.status = response.status;
      statusErr.body = response.body;
      statusErr.code = "ESTATUS";
      statusErr.authErr = OAuthError.NETWORK_ERROR;
      throw statusErr;
    }
    return data;
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
      console.warn("Failed erasing token: ", err);
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
`.split("\n "); // Here the space after "\n" is important, they represent the indentation & the space between the words when "\n" is removed.
// You can copy the string directly in the "scope" field in a browser. Keep this indentation intact.

/**
 * Returns a image array with signed url requests.
 */
export function signImagesUrls(
  images: Array<{ src: string; alt: string }>
): Array<{ src: ImageURISource; alt: string }> {
  return images.map(v => ({
    ...v,
    src: signUrl(v.src)
  }));
}

/**
 * Build a signed request from an url.
 * This function skip the signing if url points to an another web domain.
 */
export function signUrl(url: string): ImageURISource {
  // console.log(url);
  // If there is a protocol AND url doen't contain plateform url, doesn't sign it.
  if (
    url.indexOf("://") !== -1 &&
    url.indexOf(Conf.currentPlatform.url) === -1
  ) {
    // console.log("external image, not sign");
    return { uri: url };
  }
  // console.log("internal, signed");
  return OAuth2RessourceOwnerPasswordClient.connection.sign({
    method: "GET",
    uri: url
  });
}

export const getAuthHeader = () =>
  OAuth2RessourceOwnerPasswordClient.connection.sign({});
