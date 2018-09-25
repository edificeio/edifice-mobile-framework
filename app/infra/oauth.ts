/**
 * OAuth2 client for Ressource OWner Credentials Grant type flow.
 */

import { encode as btoa } from "base-64";
import querystring from "querystring";
import { AsyncStorage } from "react-native";
import { Conf } from "../Conf";

export enum ERROR_TYPES {
  invalid_request = "invalid_request",
  invalid_client = "invalid_client",
  invalid_grant = "invalid_grant",
  unauthorized_client = "unauthorized_client",
  unsupported_grant_type = "unsupported_grant_type",
  access_denied = "access_denied",
  unsupported_response_type = "unsupported_response_type",
  invalid_scope = "invalid_scope",
  server_error = "server_error",
  temporarily_unavailable = "temporarily_unavailable"
}

export interface IOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
  refresh_token: string;
  scope: string;
}

class OAuth2RessourceOwnerClient {
  /**
   * Common headers to all oauth2 flow requets
   */
  private static DEFAULT_HEADERS = {
    // tslint:disable-next-line:prettier
    "Accept": "application/json, application/x-www-form-urlencoded",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  // tslint:disable-next-line:variable-name
  private _token: IOAuthToken = null;
  public get token() {
    // TODO: refrsh if necesary ?
    return this._token;
  }
  public set token(t: IOAuthToken) {
    // TODO: refrsh if necesary ?
    this._token = t;
  }
  private accessTokenUri: string = "";
  private clientId: string = "";
  private clientSecret: string = "";
  private scope: string[] = [];

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
      console.warn(err);
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
      throw new Error("invalid Json oauth response");
    }
  }

  /**
   * Sanitize the scopes option to be a string.
   */
  public sanitizeScope(scopes: string[]): string {
    return Array.isArray(scopes) ? scopes.join(" ") : scopes || "";
  }

  /**
   * Create basic auth header.
   */
  private getAuthHeader(clientId: string, clientSecret: string): string {
    return "Basic " + btoa(clientId || "" + ":" + clientSecret || "");
  }

  /**
   * Sign a standardised request object with user authentication information.
   */
  public sign(requestObject) {
    if (!this._token || !this._token.access_token)
      throw new Error("Unable to sign without access token.");

    requestObject.headers = requestObject.headers || {};
    if (this._token.token_type.toLowerCase() === "bearer") {
      requestObject.headers.Authorization =
        "Bearer " + this._token.access_token;
    } else {
      throw new Error("Only Bearer token type supported.");
    }
    return requestObject;
  }

  /**
   * Refresh a user access token with the supplied token.
   */
  public async refreshToken() {
    if (!this._token || !this._token.refresh_token)
      throw new Error("No refresh token provided.");

    try {
      console.log("refreshing token...");
      const response = await fetch(`${this.accessTokenUri}`, {
        body: querystring.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: this._token.refresh_token,
          scope: this.sanitizeScope(this.scope)
        }),
        headers: {
          ...OAuth2RessourceOwnerClient.DEFAULT_HEADERS,
          Authorization: this.getAuthHeader(this.clientId, this.clientSecret)
        },
        method: "POST"
      });
      console.log(response);
      const data = await this.parseResponseBody(response);
      const authErr = this.getAuthError(data);
      if (authErr) throw new Error(authErr.code);
      if (response.status < 200 || response.status >= 399) {
        const statusErr = new Error("HTTP status " + response.status) as any;
        statusErr.status = response.status;
        statusErr.body = response.body;
        statusErr.code = "ESTATUS";
        throw new Error(statusErr.status + " " + statusErr.body);
      }

      this._token = {
        ...this._token,
        ...data,
        expires_at: this.getExpirationDate(data.expires_in)
      };
    } catch (e) {
      // Check error type
      console.warn(e);
    }
  }

  /**
   * Is stored token actually expired ?
   */
  public isExpired() {
    console.log(new Date(), this._token.expires_at);
    return this._token && new Date() > this._token.expires_at;
  }

  private getExpirationDate(seconds: number) {
    const expin = new Date();
    expin.setSeconds(expin.getSeconds() + seconds);
    return expin;
  }

  /**
   * Get a fresh new access token with owner credentials
   */
  public async getToken(username: string, password: string) {
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "password",
      password,
      scope: this.sanitizeScope(this.scope),
      username
    };
    const headers = {
      ...OAuth2RessourceOwnerClient.DEFAULT_HEADERS
    };

    try {
      console.log("requesting fresh tokens");
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      this._token = {
        ...data,
        expires_at: this.getExpirationDate(data.expires_in)
      };
      console.log("received new token : ", this._token);
      return this._token;
    } catch (e) {
      // Check error type
      console.warn(e);
      throw e;
    }
  }

  private async request(url: string, options: any) {
    const body = querystring.stringify(options.body);
    const query = querystring.stringify(options.query);
    if (query) {
      // append url query with the given one
      url += (url.indexOf("?") === -1 ? "?" : "&") + query;
    }
    const response = await fetch(url, {
      body,
      headers: options.headers,
      method: options.method
    });
    const data = await this.parseResponseBody(response);
    const authErr = this.getAuthError(data);
    if (authErr) throw new Error(authErr.code);
    if (response.status < 200 || response.status >= 399) {
      const statusErr = new Error("HTTP status " + response.status) as any;
      statusErr.status = response.status;
      statusErr.body = response.body;
      statusErr.code = "ESTATUS";
      throw new Error(statusErr.status + " " + statusErr.body);
    }
    return data;
  }

  public unsetToken() {
    this._token = null;
  }
}

const oauth = new OAuth2RessourceOwnerClient(
  `${Conf.platform}/auth/oauth2/token`,
  "app-e",
  "ODE",
  ["userinfo", "homeworks"]
);

export default oauth;

/**
 * Force get a fresh new token with given credentials.
 * @param credentials
 */
export async function getToken(credentials: {
  username: string;
  password: string;
}) {
  try {
    await oauth.getToken(credentials.username, credentials.password);
    // tslint:disable-next-line:no-console
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("get token failed.", errmsg);
    throw errmsg;
  }
}

/**
 * Read stored token in local storage.
 */
export async function loadToken(): Promise<IOAuthToken> {
  try {
    // tslint:disable-next-line:no-console
    const token = JSON.parse(await AsyncStorage.getItem("token"));
    if (!token) throw new Error("No token stored");
    console.log("load saved token");
    // tslint:disable-next-line:no-console
    console.log(token);
    oauth.token = token;
    return token;
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("load token failed.", errmsg);
    throw errmsg;
  }
}

/**
 * Saves given token information in local storage.
 */
export async function saveToken(token: IOAuthToken) {
  try {
    await AsyncStorage.setItem("token", JSON.stringify(token));
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.warn("saving token failed.");
    throw err;
  }
}

/**
 * Earse stored token information in local storage.
 */
export async function eraseToken() {
  try {
    await AsyncStorage.removeItem("token");
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.warn("erasing token failed.");
    throw err;
  }
}
