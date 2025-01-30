import moment from "moment";
import { getStore } from "~/app/store";
import { accountIsActive, AuthActiveAccount, AuthCredentials, AuthSavedLoggedInAccount, AuthTokenSet, DateTimeString, getSerializedLoggedInAccountInfo, isSerializedLoggedInAccount } from "~/framework/modules/auth/model";
import { AccountError, AccountErrorCode } from "~/framework/modules/auth/model/error";
import { actions as authActions } from '~/framework/modules/auth/reducer';
import { writeUpdateAccount } from "~/framework/modules/auth/storage";
import appConf, { Platform } from "~/framework/util/appConf";
import { Error } from "~/framework/util/error";
import http, { HTTPError } from "~/framework/util/http";
import { FetchError, FetchErrorCode } from "~/framework/util/http/error";
import { ModuleArray } from "~/framework/util/moduleTool";
import { IOAuthCustomToken, OAuth2RessourceOwnerPasswordClient } from "~/infra/oauth";

// This is a big hack to prevent circular dependencies. AllModules.tsx must not included from modules theirself.
// ToDo: find a better way to handle this.
export const AppModules = {
  value: undefined,
} as {
  value?: ModuleArray;
};

/**
 * Represents the client (device) information required for OAuth2 authentication.
 */
export interface OAuth2ClientInfo {
  clientId: string;
  clientSecret: string;
}

namespace API {
  export interface OAuth2ResponseOK {
    token_type: string;
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }
  export interface OAuth2ResponseError {
    error: string;
    error_description: string;
  }
}

/**
 * The time delta (in seconds) to apply to the token's expiration date to account for network latency.
 */
export const tokenExpirationDeltaSeconds = 3 * 60; // 3 minutes

/**
 * Checks if the given token is expired.
 * A time delta is applied to the token's expiration date to account for network latency.
 *
 * @param token - An object containing the token's expiration date as a string.
 * @returns `true` if the token is expired, `false` otherwise.
 *
 * @remarks
 * This function currently uses `moment` to perform the date comparison.
 * ToDo: Update the implementation to use `Temporal` instead of `moment`.
 */
export const isTokenExpired = (token: { expiresAt: DateTimeString }): boolean =>
  moment().subtract(tokenExpirationDeltaSeconds, 'seconds').isAfter(moment(token.expiresAt));

// __DEBUG__ : Uncomment the following line to simulate token expiration randomly
// export const isTokenExpired = (token: { expiresAt: DateTimeString }): boolean =>
//   moment.now() % 2 === 0;

/**
 * Creates a client (device) authentication header for OAuth2.
 *
 * @param clientId - The client ID for the OAuth2 client.
 * @param clientSecret - The client secret for the OAuth2 client.
 * @returns A string representing the Basic Authentication header.
 */
const createDeviceAuthenticationHeader = (clientId: string, clientSecret: string): string => {
  return 'Basic ' + btoa(clientId + ':' + clientSecret);
}

/**
 * Creates a string representation of the OAuth2 scopes.
 * This function retrieves the scopes from the `AppModules` object.
 *
 * @returns A space-separated string of OAuth2 scopes.
 */
const createScope = (): string => [...(new Set(AppModules.value!.getScopes()))].join(' ');


/**
 * Fetches an OAuth2 token for the specified platform using the given grant type and parameters.
 *
 * @param platform - The platform for which the token is being fetched.
 * @param grantType - The OAuth2 grant type to be used.
 * @param params - Additional parameters to be included in the token request according to the grantType.
 * @returns A promise that resolves to an AuthTokenSet.
 * @throws Will throw an error if the token fetch fails.
 */
const fetchToken = async (platform: Platform, grantType: string, params: {}): Promise<AuthTokenSet> => {
  try {
    const body = {
      grant_type: grantType,
      ...params,
      ...platform.oauth,
      scope: createScope(),
    };
    const headers = {
      Accept: 'application/json, application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: createDeviceAuthenticationHeader(platform.oauth.client_id, platform.oauth.client_secret),
    }
    const response = await http.fetchJsonForPlatform<API.OAuth2ResponseOK>(platform, 'POST', '/auth/oauth2/token', {
      body: new URLSearchParams(body).toString(),
      headers
    });
    return tokenFactory(response);
  } catch (e) {
    if (e instanceof HTTPError) {
      console.error('[OAuth2] Error fetching token:', e, await e.clone().text());
      throw await oAuth2ErrorFactory(e);
    } else {
      console.error('[OAuth2] Error fetching token:', e);
      throw e;
    }
  }
}

/**
 * Generates an AuthTokenSet by parsing the given OAuth2 response data.
 *
 * @param data - The OAuth2 response data containing token information.
 * @returns An AuthTokenSet containing access and refresh tokens, along with their metadata.
 * @throws Will throw an error if the token type is not 'Bearer'.
 */
const tokenFactory = (data: Partial<API.OAuth2ResponseOK>): AuthTokenSet => {
  if (data.token_type !== 'Bearer') throw new FetchError(FetchErrorCode.BAD_RESPONSE, `[OAuth2] Unsupported token type: ${data.token_type}`);
  if (!data.access_token || !data.refresh_token || !data.scope) throw new FetchError(FetchErrorCode.BAD_RESPONSE, `[OAuth2] Incomplete token data`);
  return {
    access: {
      type: data.token_type,
      value: data.access_token,
      expiresAt: moment().add(data.expires_in, 'seconds').toISOString(),
    },
    refresh: {
      value: data.refresh_token,
    },
    scope: data.scope.split(' '),
  };
}

/**
 * Utility object for obtaining OAuth2 tokens using different authentication methods.
 */
export const getOAuth2Token = {
  /**
   * Fetches an OAuth2 token using login and password credentials.
   * 
   * @param platform - The platform for which the token is being requested.
   * @param login - The user's login name.
   * @param password - The user's password.
   * @returns A promise that resolves to the fetched token.
   */
  withLoginPassword: (platform: Platform, credentials: AuthCredentials) => fetchToken(platform, 'password', { username: credentials.username, password: credentials.password }),

  /**
   * Fetches an OAuth2 token using a SAML2 assertion.
   * 
   * @param platform - The platform for which the token is being requested.
   * @param saml2 - The SAML2 assertion.
   * @returns A promise that resolves to the fetched token.
   */
  withSaml2: (platform: Platform, saml2: string) => {
    try {
      return fetchToken(platform, 'saml2', { assertion: saml2 });
    } catch (e) {
      // When login in with saml2, "CREDENTIALS_MISMATCH" is the errcode obtained if the saml token does not link to an actual user account.
      // We override the error type to "SAML_INVALID" in this case.
      if (e instanceof OAuth2Error && e.code === OAuth2ErrorCode.CREDENTIALS_MISMATCH) {
        throw new OAuth2Error(OAuth2ErrorCode.SAML_INVALID, 'Invalid SAML2 assertion', { cause: e.cause });
      } else {
        throw e;
      }
    }
  },

  /**
   * Fetches an OAuth2 token using a custom token.
   * 
   * @param platform - The platform for which the token is being requested.
   * @param customToken - The custom token.
   * @returns A promise that resolves to the fetched token.
   */
  withCustomToken: (platform: Platform, customToken: string) => fetchToken(platform, 'custom_token', { custom_token: customToken }),

  /**
   * Fetches an OAuth2 token using a refresh token.
   * 
   * @param platform - The platform for which the token is being requested.
   * @param refreshToken - The refresh token.
   * @returns A promise that resolves to the fetched token.
   */
  withRefreshToken: async (platform: Platform, refreshToken: AuthTokenSet['refresh']) => fetchToken(platform, 'refresh_token', { refresh_token: refreshToken.value }),
}

/**
 * Refreshes the OAuth2 token for the given account.
 *
 * @param account - The account for which the token needs to be refreshed. This can be either an `AuthSavedLoggedInAccount` or an `AuthActiveAccount`.
 * 
 * @throws {AccountError} If the platform configuration is invalid.
 * 
 * The function performs the following steps:
 * 1. Retrieves a new token using the refresh token from the account.
 * 2. Updates the account in the store and storage with the new token.
 * 3. If the account is active, updates the legacy OAuth2 client with the new token.
 */
export const refreshTokenForAccount = async (account: AuthSavedLoggedInAccount | AuthActiveAccount) => {
  // 1. Get new token
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) throw new AccountError(AccountErrorCode.INVALID_PLATFORM_CONFIG, `Platform not foune: ${account.platform}`);
  const newTokens = await getOAuth2Token.withRefreshToken(platform, account.tokens.refresh);

  // 2. Update account in store + storage
  getStore().dispatch(authActions.refreshToken(account.user.id, newTokens));
  const serialisedAccount = isSerializedLoggedInAccount(account) ? account : getSerializedLoggedInAccountInfo(account);
  writeUpdateAccount(serialisedAccount); // Update Storage

  // 3. If this account is active, update LEGACY OAuth2 client woth new token
  if (accountIsActive(account)) {
    OAuth2RessourceOwnerPasswordClient.connection?.importToken(newTokens);
  }
}

export enum OAuth2ErrorCode {
  /** Invalid OAuth2 clientID / clientSecret */
  OAUTH2_INVALID_CLIENT = 'OAuth2ErrorCode|OAUTH2_INVALID_CLIENT',
  /** Invalid OAuth2 grant (ex scope) */
  OAUTH2_INVALID_GRANT = 'OAuth2ErrorCode|OAUTH2_INVALID_GRANT',
  /** Invalid login/password pair */
  CREDENTIALS_MISMATCH = 'OAuth2ErrorCode|CREDENTIALS_MISMATCH',
  /** Invalid refresh token */
  REFRESH_INVALID = 'OAuth2ErrorCode|REFRESH_INVALID',
  /** Invalid saml assertion */
  SAML_INVALID = 'OAuth2ErrorCode|SAML_INVALID',
  /** Saml assertion corresponds to multiple accounts, need to login with given custom token */
  SAML_MULTIPLE_VECTOR = 'OAuth2ErrorCode|SAML_MULTIPLE_VECTOR',
  /** Brute-force prevention */
  SECURITY_TOO_MANY_TRIES = 'OAuth2ErrorCode|SECURITY_TOO_MANY_TRIES',
  /** Account is individually blocked */
  ACCOUNT_BLOCKED = 'OAuth2ErrorCode|ACCOUNT_BLOCKED',
  /** Distant backend is in maintenance */
  PLATFORM_UNAVAILABLE = 'OAuth2ErrorCode|PLATFORM_UNAVAILABLE',
  /** Distant platform has quota overflow */
  PLATFORM_TOO_LOAD = 'OAuth2ErrorCode|PLATFORM_TOO_LOAD',
  /** Distant platform refuses certain account types */
  PLATFORM_BLOCKED_TYPE = 'OAuth2ErrorCode|PLATFORM_BLOCKED_TYPE',
  /** User denied for non-specified or unknown reason */
  UNKNOWN_DENIED = 'OAuth2ErrorCode|UNKNOWN_DENIED',
  /** Given password was an activation code, need to follow account activation scernario */
  ACTIVATION_CODE = 'OAuth2ErrorCode|ACTIVATION_CODE',
  /** Given password was a password reset code, need to follow account password reset scernario */
  PASSWORD_RESET = 'OAuth2ErrorCode|PASSWORD_RESET',
}

/**
 * Represents an OAuth2 error.
 * 
 * This class extends the built-in `Error` class to provide additional
 * information specific to OAuth2 errors, such as an error code.
 * 
 * Do NOT use the base `OAuth2Error` directly for the error type `OAuth2ErrorCode.SAML_MULTIPLE_VECTOR`,
 * use the `OAuth2SamlMultipleVectorError` class instead.
 * 
 * @extends {Error}
 * 
 * @param {OAuth2ErrorCode} code - The specific OAuth2 error code.
 * @param {...ConstructorParameters<typeof global.Error>} args - Additional arguments passed to the base `Error` constructor.
 */
export class OAuth2Error extends global.Error implements Error.WithCode<OAuth2ErrorCode> {
  constructor(public readonly code: OAuth2ErrorCode, ...args: ConstructorParameters<typeof global.Error>) {
    super(...args);
    this.name = 'OAuth2Error'; // Note: built-in Error class break the prototype chain when extending it like this...
    Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
    // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
  }
}


/**
 * Represents an error that occurs when multiple SAML vectors are detected during OAuth2 authentication.
 * This error extends the `OAuth2Error` class.
 * Do NOT use the base `OAuth2Error` directly for this error type (`OAuth2ErrorCode.SAML_MULTIPLE_VECTOR`).
 *
 * @class OAuth2SamlMultipleVectorError
 * @extends {OAuth2Error}
 * 
 * @param {Object} data - The error data containing an array of users.
 * @param {IOAuthCustomToken[]} data.users - An array of custom OAuth tokens associated with the users.
 * @param {...any} args - Additional arguments passed to the base `Error` class.
 * 
 * @example
 * throw new OAuth2SamlMultipleVectorError({ users: [...] }, 'Error message');
 */
export class OAuth2SamlMultipleVectorError extends OAuth2Error implements Error.WithCode<OAuth2ErrorCode.SAML_MULTIPLE_VECTOR> {
  public readonly code: OAuth2ErrorCode.SAML_MULTIPLE_VECTOR = OAuth2ErrorCode.SAML_MULTIPLE_VECTOR; // Must be redefined here to avoid TypeScript error
  constructor(public readonly data: { users: IOAuthCustomToken[] }, ...args: ConstructorParameters<typeof global.Error>) {
    super(OAuth2ErrorCode.SAML_MULTIPLE_VECTOR, ...args); // Note: built-in Error class break the prototype chain when extending it like this...
    Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
    // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
  }
}

/**
 * Factory function to create an appropriate OAuth2Error or return the original HTTPError
 * based on the error response content.
 *
 * @param e - The HTTPError object containing the error response.
 * @returns A promise that resolves to an OAuth2Error or the original HTTPError.
 *
 * The function parses the error response content and checks the `error` field to determine
 * the type of error. Depending on the `error` and `error_description` fields, it returns
 * a specific OAuth2Error instance or the original HTTPError.
 *
 * If the `error` field is not recognized, the original HTTPError is returned.
 */
export async function oAuth2ErrorFactory(e: HTTPError): Promise<OAuth2Error | HTTPError> {
  const content = await e.json() as Partial<API.OAuth2ResponseError>;
  if (!content.error) return e;
  switch (content.error) {
    case 'invalid_client': return new OAuth2Error(OAuth2ErrorCode.OAUTH2_INVALID_CLIENT, content.error_description, { cause: e });
    case 'invalid_grant': return new OAuth2Error(OAuth2ErrorCode.OAUTH2_INVALID_GRANT, content.error_description, { cause: e });
    case 'quota_overflow': return new OAuth2Error(OAuth2ErrorCode.PLATFORM_TOO_LOAD, content.error_description, { cause: e });
    case 'access_denied': switch (content.error_description) {
      case 'auth.error.authenticationFailed': return new OAuth2Error(OAuth2ErrorCode.CREDENTIALS_MISMATCH, content.error_description, { cause: e });
      case 'auth.error.blockedUser': return new OAuth2Error(OAuth2ErrorCode.ACCOUNT_BLOCKED, content.error_description, { cause: e });
      case 'auth.error.blockedProfileType': return new OAuth2Error(OAuth2ErrorCode.PLATFORM_BLOCKED_TYPE, content.error_description, { cause: e });
      case 'auth.error.global': return new OAuth2Error(OAuth2ErrorCode.PLATFORM_UNAVAILABLE, content.error_description, { cause: e });
      case 'auth.error.ban': return new OAuth2Error(OAuth2ErrorCode.SECURITY_TOO_MANY_TRIES, content.error_description, { cause: e });
      case 'auth.error.activation.code': return new OAuth2Error(OAuth2ErrorCode.ACTIVATION_CODE, content.error_description, { cause: e });
      case 'auth.error.password.reset': return new OAuth2Error(OAuth2ErrorCode.PASSWORD_RESET, content.error_description, { cause: e });
      default: return new OAuth2Error(OAuth2ErrorCode.UNKNOWN_DENIED, content.error_description, { cause: e });
    };
    case 'multiple_vector_choice': {
      if (content.error_description) {
        const data = JSON.parse(content.error_description) as { users: IOAuthCustomToken[] };
        return new OAuth2SamlMultipleVectorError(data, undefined, { cause: e });
      } else {
        return e;
      }
    };
  }
  return e;
}