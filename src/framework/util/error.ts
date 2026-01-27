/**
 * Error enums must be string enum to ensure values are unique between all them.
 * Be SURE to NOT reuse same values accross different categories.
 */

import React from 'react';

import DeviceInfo from 'react-native-device-info';

import { FetchErrorCode } from './transport/error';

import { I18n } from '~/app/i18n';
import { AccountErrorCode } from '~/framework/modules/auth/model/error';
import { OAuth2ErrorCode } from '~/framework/util/oauth2';

export namespace Error {
  /**
   * Represents an Error and its generation key.
   * It depends on the screen that led to its generation so that it can be displayed only once on the correct screen. */
  export interface WithKey {
    info: Error;
    key?: number;
  }

  export interface WithCode<CodeType> extends Error {
    code: CodeType;
  }

  /**
   * Retrieves the deepest cause of an error by traversing the `cause` property.
   *
   * @param e - The error object or unknown value to inspect.
   * @returns The deepest error object or the original value if no deeper cause is found.
   */
  export const getDeepError = (e: typeof global.Error | unknown) => {
    let currentError = e;
    while (currentError instanceof global.Error && currentError.cause !== undefined) {
      currentError = currentError.cause;
    }
    return currentError;
  };

  /**
   * Generates a error key to be stored in a ErrorWithKey object.
   * The error key is a unique number based on a precise timestamp.
   */
  export const generateErrorKey = performance.now;

  export enum AnyErrorType {}

  export class ErrorWithType<Types = AnyErrorType> extends global.Error {
    constructor(
      public type: Types,
      ...args: ConstructorParameters<typeof global.Error>
    ) {
      super(...args); // Note: built-in Error class break the prototype chain when extending it like this...
      Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
      // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    }
  }

  /**
   * Dig into every cause of the given error to return the last encountered type.
   * @param error
   * @returns
   */
  export const getDeepErrorType = <ErrorClass = ErrorWithType>(error?: WithKey | Error) => {
    let currentError = (error as WithKey)?.info ?? error;
    let type: Error.ErrorTypes<ErrorClass> | undefined | unknown;
    do {
      if (currentError instanceof Error.ErrorWithType) type = currentError.type as Error.ErrorTypes<ErrorClass>;
      else if (currentError instanceof global.Error && (currentError as WithCode<unknown>).code !== undefined)
        type = (currentError as WithCode<unknown>).code;
      currentError = currentError?.cause as Error;
    } while (currentError);
    return type;
  };

  type Constructor<T> = new (...args: any[]) => T;

  export type ErrorTypes<ErrorClass> = ErrorClass extends Constructor<ErrorWithType<infer T>> ? T : AnyErrorType;

  export enum FetchErrorType {
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED', // Signed request but no token available
    NETWORK_ERROR = 'NETWORK_ERROR', // Server is unreachable or not responding
    NOT_OK = 'NOT_OK', // Response is not Http 2xx
    BAD_RESPONSE = 'BAD_RESPONSE', // Response is Http 2xx but given data is unintended
    TIMEOUT = 'TIMEOUT',
  }

  export const FetchError = ErrorWithType<FetchErrorType>;

  export const OAuth2Error = ErrorWithType<OAuth2ErrorCode | ErrorTypes<typeof FetchError>>;

  export enum LoginErrorType {
    NO_SPECIFIED_PLATFORM = 'NO_SPECIFIED_PLATFORM',
    INVALID_PLATFORM = 'INVALID_PLATFORM',
    ACCOUNT_INELIGIBLE_NOT_PREMIUM = 'ACCOUNT_INELIGIBLE_NOT_PREMIUM',
    ACCOUNT_INELIGIBLE_PRE_DELETED = 'ACCOUNT_INELIGIBLE_PRE_DELETED',
    TOO_MANY_ACCOUNTS = 'TOO_MANY_ACCOUNTS',
  }

  export const LoginError = ErrorWithType<LoginErrorType | ErrorTypes<typeof OAuth2Error>>;

  export const getAuthErrorText = <ErrorClass = ErrorWithType>(
    type: Error.ErrorTypes<ErrorClass> | undefined,
    platformUrl: string,
  ) => {
    switch (type) {
      case Error.FetchErrorType.NOT_AUTHENTICATED:
      case FetchErrorCode.NOT_LOGGED:
        return I18n.get('auth-error-notinitilized');
      case Error.FetchErrorType.BAD_RESPONSE:
      case FetchErrorCode.PARSE_ERROR:
      case FetchErrorCode.BAD_RESPONSE:
        return I18n.get('auth-error-badresponse');
      case Error.FetchErrorType.NETWORK_ERROR:
      case FetchErrorCode.NETWORK_ERROR:
        return I18n.get('auth-error-networkerror');
      case Error.FetchErrorType.NOT_OK:
      case FetchErrorCode.NOT_OK:
        return I18n.get('auth-error-unknownresponse');
      case Error.FetchErrorType.TIMEOUT:
      case FetchErrorCode.TIMEOUT:
        return I18n.get('auth-error-networkerror');

      case OAuth2ErrorCode.OAUTH2_INVALID_CLIENT:
        return I18n.get('auth-error-invalidclient', { version: DeviceInfo.getVersion() });
      case OAuth2ErrorCode.OAUTH2_INVALID_GRANT:
        return I18n.get('auth-error-invalidgrant');
      case OAuth2ErrorCode.PLATFORM_TOO_LOAD:
        return I18n.get('auth-error-tooload');
      case OAuth2ErrorCode.PLATFORM_UNAVAILABLE:
        return I18n.get('auth-error-platformunavailable');
      case OAuth2ErrorCode.REFRESH_INVALID:
        return I18n.get('auth-error-restorefail');
      case OAuth2ErrorCode.SECURITY_TOO_MANY_TRIES:
        return I18n.get('auth-error-toomanytries');
      case OAuth2ErrorCode.UNKNOWN_DENIED:
        return I18n.get('auth-error-unknowndenied');
      case OAuth2ErrorCode.CREDENTIALS_MISMATCH:
        return I18n.get('auth-error-badcredentials');
      case OAuth2ErrorCode.SAML_INVALID:
        return I18n.get('auth-error-badsaml');
      case OAuth2ErrorCode.PLATFORM_BLOCKED_TYPE:
        return I18n.get('auth-error-blockedtype');
      case OAuth2ErrorCode.ACCOUNT_BLOCKED:
        return I18n.get('auth-error-blockeduser');
      case OAuth2ErrorCode.ACTIVATION_CODE:
        return I18n.get('auth-error-activationcode');
      case OAuth2ErrorCode.PASSWORD_RESET:
        return I18n.get('auth-error-passwordreset');

      case Error.LoginErrorType.NO_SPECIFIED_PLATFORM:
      case Error.LoginErrorType.INVALID_PLATFORM:
      case AccountErrorCode.INVALID_PLATFORM_CONFIG:
        return I18n.get('auth-error-runtimeerror');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_NOT_PREMIUM:
        return I18n.get('auth-error-notpremium');
      case Error.LoginErrorType.ACCOUNT_INELIGIBLE_PRE_DELETED:
      case AccountErrorCode.ACCOUNT_INELIGIBLE_PRE_DELETED:
        return I18n.get('auth-error-predeleted', { currentplatform: platformUrl });

      case OAuth2ErrorCode.SAML_MULTIPLE_VECTOR:
      default:
        return I18n.get('auth-error-unknownerror');
    }
  };
}

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
  platformUrl: string,
  error?: Error.WithKey,
  consumeError?: (errorKey: number) => void,
) => {
  const [errkey, setErrkey] = React.useState(Error.generateErrorKey);
  const showError = error?.key === errkey || error?.key === undefined;
  const errtype = React.useMemo(() => (showError ? Error.getDeepErrorType<ErrorClass>(error) : undefined), [error, showError]);
  const errclear = React.useCallback(() => {
    if (error && showError) setErrkey(Error.generateErrorKey());
  }, [error, showError]);
  const errmsg = React.useMemo(
    () =>
      showError && error ? Error.getAuthErrorText<ErrorClass>(errtype as Error.ErrorTypes<ErrorClass>, platformUrl) : undefined,
    [error, errtype, platformUrl, showError],
  );
  React.useEffect(() => {
    if (error?.key === undefined) {
      consumeError?.(errkey);
    }
    // only launch this once after screen mount to mark error key if undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { errclear, errkey, errmsg, errtype } as const;
};
