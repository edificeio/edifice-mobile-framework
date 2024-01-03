export namespace Error {
  enum EmptyEnum {}

  type Constructor<T> = new (...args: any[]) => T;

  export type ErrorTypes<ErrorClass> = ErrorClass extends Constructor<ErrorWithType<infer T>> ? T : EmptyEnum;

  class ErrorWithType<Types = EmptyEnum> extends global.Error {
    constructor(
      public type: Types,
      message?: ConstructorParameters<typeof global.Error>[0],
      options?: ConstructorParameters<typeof global.Error>[1],
    ) {
      super(message, options); // Note: built-in Error class break the prototype chain when extending it like this...
      Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
      // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    }
  }

  enum FetchErrorType {
    NETWORK_ERROR, // Server is unreachable or not responding
    BAD_RESPONSE, // Response given but data is unintended
  }

  export const FetchError = ErrorWithType<FetchErrorType>;

  const a = new FetchError(FetchErrorType.BAD_RESPONSE);

  enum OAuth2ErrorType {
    // App config related
    OAUTH2_INVALID_CLIENT, // Invalid OAuth2 clientID / clientSecret
    OAUTH2_INVALID_GRANT, // Invalid OAuth2 grant (ex scope)
    // Credentials (login/pwd) related
    CREDENTIALS_MISMATCH, // Invalid login/pwd pair
    // SAML (Federation)
    SAML_INVALID, // Invalid saml token
    SAML_MULTIPLE_VECTOR, // saml token corresponds to multiple accounts, need to login with given custom token
    // Security related
    SECURITY_TOO_MANY_TRIES, // Brute-force prevention
    // Account related
    ACCOUNT_BLOCKED, // Specified account is blocked
    // Platform availability related
    PLATFORM_UNAVAILABLE, // Distant backend is in maintenance
    PLATFORM_TOO_LOAD, // Distant platform has quota overflow
    PLATFORM_BLOCKED_TYPE, // Distant platform refuses certain account types
    // Unknown reason
    UNKNOWN_DENIED, // User denied for non-specified reason
  }

  const b = new FetchError(OAuth2ErrorType.ACCOUNT_BLOCKED);

  export const OAuth2Error = ErrorWithType<OAuth2ErrorType | ErrorTypes<typeof FetchError>>;

  const c = new OAuth2Error(OAuth2ErrorType.OAUTH2_INVALID_GRANT);
  const d = new OAuth2Error(FetchErrorType.BAD_RESPONSE);

  enum LoginErrorType {
    ACCOUNT_INELIGIBLE_NOT_PREMIUM,
    ACCOUNT_INELIGIBLE_PRE_DELETED,
    TOO_MANY_ACCOUNTS,
  }

  const e = new OAuth2Error(LoginErrorType.TOO_MANY_ACCOUNTS);

  export const LoginError = ErrorWithType<LoginErrorType | ErrorTypes<typeof OAuth2Error>>;

  const f = new LoginError(LoginErrorType.TOO_MANY_ACCOUNTS);
}
