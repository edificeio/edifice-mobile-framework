/**
 * Error enums must be string enum to ensure values are unique between all them.
 * Be SURE to NOT reuse same values accross different categories.
 */

import * as React from 'react';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';

export namespace Error {
  enum EmptyEnum {}

  type Constructor<T> = new (...args: any[]) => T;

  export type ErrorTypes<ErrorClass> = ErrorClass extends Constructor<ErrorWithType<infer T>> ? T : EmptyEnum;

  export class ErrorWithType<Types = EmptyEnum> extends global.Error {
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

  export interface ErrorWithKey {
    info: Error;
    key?: number;
  }

  export const getDeepErrorType = <ErrorClass = ErrorWithType>(error?: ErrorWithKey) => {
    let currentError = error?.info;
    let type: Error.ErrorTypes<ErrorClass> | undefined;
    do {
      if (currentError instanceof Error.ErrorWithType) type = currentError.type as Error.ErrorTypes<ErrorClass>;
      currentError = currentError?.cause as Error;
    } while (currentError);
    return type;
  };

  export enum FetchErrorType {
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED', // Signed request but no token available
    NETWORK_ERROR = 'NETWORK_ERROR', // Server is unreachable or not responding
    NOT_OK = 'NOT_OK', // Response is not Http 2xx
    BAD_RESPONSE = 'BAD_RESPONSE', // Response is Http 2xx but given data is unintended
  }

  export const FetchError = ErrorWithType<FetchErrorType>;

  export enum OAuth2ErrorType {
    // App config related
    OAUTH2_MISSING_CLIENT = 'OAUTH2_MISSING_CLIENT', // clientID / clientSecret not intialized
    OAUTH2_INVALID_CLIENT = 'OAUTH2_INVALID_CLIENT', // Invalid OAuth2 clientID / clientSecret
    OAUTH2_INVALID_GRANT = 'OAUTH2_INVALID_GRANT', // Invalid OAuth2 grant (ex scope)
    // Credentials (login/pwd) related
    CREDENTIALS_MISMATCH = 'CREDENTIALS_MISMATCH', // Invalid login/pwd pair
    // Refresh token related
    REFRESH_INVALID = 'REFRESH_INVALID', // Invalid refresh token
    // SAML (Federation)
    SAML_INVALID = 'SAML_INVALID', // Invalid saml token
    SAML_MULTIPLE_VECTOR = 'SAML_MULTIPLE_VECTOR', // saml token corresponds to multiple accounts, need to login with given custom token
    // Security related
    SECURITY_TOO_MANY_TRIES = 'SECURITY_TOO_MANY_TRIES', // Brute-force prevention
    // Account related
    ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED', // Specified account is blocked
    // Platform availability related
    PLATFORM_UNAVAILABLE = 'PLATFORM_UNAVAILABLE', // Distant backend is in maintenance
    PLATFORM_TOO_LOAD = 'PLATFORM_TOO_LOAD', // Distant platform has quota overflow
    PLATFORM_BLOCKED_TYPE = 'PLATFORM_BLOCKED_TYPE', // Distant platform refuses certain account types
    // Unknown reason
    UNKNOWN_DENIED = 'UNKNOWN_DENIED', // User denied for non-specified reason
  }

  export const OAuth2Error = ErrorWithType<OAuth2ErrorType | ErrorTypes<typeof FetchError>>;

  export enum LoginErrorType {
    NO_SPECIFIED_PLATFORM = 'NO_SPECIFIED_PLATFORM',
    INVALID_PLATFORM = 'INVALID_PLATFORM',
    ACCOUNT_INELIGIBLE_NOT_PREMIUM = 'ACCOUNT_INELIGIBLE_NOT_PREMIUM',
    ACCOUNT_INELIGIBLE_PRE_DELETED = 'ACCOUNT_INELIGIBLE_PRE_DELETED',
    TOO_MANY_ACCOUNTS = 'TOO_MANY_ACCOUNTS',
  }

  export const LoginError = ErrorWithType<LoginErrorType | ErrorTypes<typeof OAuth2Error>>;

  export const getAuthErrorText = <ErrorClass = ErrorWithType>(type?: Error.ErrorTypes<ErrorClass>) => {
    switch (type) {
      case Error.FetchErrorType.NOT_AUTHENTICATED:
        return I18n.get('auth-error-notinitilized');
      case Error.FetchErrorType.BAD_RESPONSE:
        return I18n.get('auth-error-badresponse');
      case Error.FetchErrorType.NETWORK_ERROR:
        return I18n.get('auth-error-networkerror');
      case Error.FetchErrorType.NOT_OK:
        return I18n.get('auth-error-unknownresponse');

      case Error.OAuth2ErrorType.OAUTH2_INVALID_CLIENT:
        return I18n.get('auth-error-invalidclient', { version: DeviceInfo.getVersion() });
      case Error.OAuth2ErrorType.OAUTH2_MISSING_CLIENT:
        return I18n.get('auth-error-notinitilized');
      case Error.OAuth2ErrorType.OAUTH2_INVALID_GRANT:
        return I18n.get('auth-error-invalidgrant');
      case Error.OAuth2ErrorType.PLATFORM_TOO_LOAD:
        return I18n.get('auth-error-tooload');
      case Error.OAuth2ErrorType.PLATFORM_UNAVAILABLE:
        return I18n.get('auth-error-platformunavailable');
      case Error.OAuth2ErrorType.REFRESH_INVALID:
        return I18n.get('auth-error-restorefail');
      case Error.OAuth2ErrorType.SECURITY_TOO_MANY_TRIES:
        return I18n.get('auth-error-toomanytries');
      case Error.OAuth2ErrorType.UNKNOWN_DENIED:
        return I18n.get('auth-error-unknowndenied');
      case Error.OAuth2ErrorType.CREDENTIALS_MISMATCH:
        return I18n.get('auth-error-badcredentials');
      case Error.OAuth2ErrorType.SAML_INVALID:
        return I18n.get('auth-error-badsaml');
      case Error.OAuth2ErrorType.PLATFORM_BLOCKED_TYPE:
        return I18n.get('auth-error-blockedtype');
      case Error.OAuth2ErrorType.ACCOUNT_BLOCKED:
        return I18n.get('auth-error-blockeduser');

      case Error.LoginErrorType.NO_SPECIFIED_PLATFORM:
      case Error.LoginErrorType.INVALID_PLATFORM:
        return I18n.get('auth-error-runtimeerror');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_NOT_PREMIUM:
        return I18n.get('auth-error-notpremium');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_PRE_DELETED:
        return I18n.get('auth-error-predeleted');

      case Error.OAuth2ErrorType.SAML_MULTIPLE_VECTOR:
      default:
        return I18n.get('auth-error-unknownerror');
    }
  };
}

const generateErrorKey = performance.now;

/**
 * Manage the raw error informatino and returns usable valeus like error message, type, and clear function.
 * @param error error structure with info & key
 * @param consumeError function to update the key whenever it's undefined
 * @returns an object containing error information :
 *  - errmsg : i18n translated message if the error needs to be displayed. If the given error has been cleared, contains `undefined`
 *  - errtype : the enum type of the error, if any. If the given error has been cleared, contains `undefined`
 *  - errkey : current key of the displaying context. Contains the timestamp of the last screen mount / error cleared
 *  - errclear : function to call to clear the error (set state, so it does fire a re-render !).
 */
export const useErrorWithKey = <ErrorClass = Error.ErrorWithType>(
  error?: Error.ErrorWithKey,
  consumeError?: (errorKey: number) => void,
) => {
  const [errkey, setErrkey] = React.useState(generateErrorKey);
  const showError = error?.key === errkey || error?.key === undefined;
  const errtype = React.useMemo(() => (showError ? Error.getDeepErrorType<ErrorClass>(error) : undefined), [error, showError]);
  const errclear = React.useCallback(() => {
    if (error && showError) setErrkey(generateErrorKey());
  }, [error, showError]);
  const errmsg = React.useMemo(
    () => (showError && error ? Error.getAuthErrorText<ErrorClass>(errtype) : undefined),
    [error, errtype, showError],
  );
  React.useEffect(() => {
    if (error?.key === undefined) {
      consumeError?.(errkey);
    }
    // only launch this once after screen mount to mark error key if undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { errmsg, errtype, errkey, errclear } as const;
};
