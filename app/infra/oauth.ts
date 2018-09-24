/**
 * OAuth2 client for Ressource OWner Credentials Grant type flow.
 */

import { encode as btoa } from "base-64";
import querystring from "querystring";
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
    return this._token;
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
      requestObject.headers.Authorization = "Bearer " + this._token.access_token;
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
      const response = await fetch(`${this.accessTokenUri}`, {
        body: querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: this._token.refresh_token
        }),
        headers: {
          ...OAuth2RessourceOwnerClient.DEFAULT_HEADERS,
          Authorization: this.getAuthHeader(this.clientId, this.clientSecret)
        },
        method: "POST"
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
    return this._token && Date.now() > this._token.expires_at.getTime();
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
      const data = await this.request(this.accessTokenUri, {
        body,
        headers,
        method: "POST"
      });
      this._token = {
        ...data,
        expires_at: this.getExpirationDate(data.expires_in)
      };
    } catch (e) {
      // Check error type
      console.warn(e);
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
}

export default new OAuth2RessourceOwnerClient(
  `${Conf.platform}/auth/oauth2/token`,
  "app-e",
  "ODE",
  ["userinfo"]
);
