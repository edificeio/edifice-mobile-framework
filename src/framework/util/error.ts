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

  export const hasCode = (e: unknown): e is WithCode<unknown> => e instanceof global.Error && Object.hasOwn(e, 'code');

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
   * Returns the deepest cause of the given error.
   * Returns the given error if it has no causes
   * @param error
   * @returns
   */
  export const getCause = (error: { cause?: unknown }): unknown => {
    let currentError: typeof error | null | undefined = error;
    do {
      if (currentError?.cause === undefined) return currentError;
      currentError = currentError.cause;
    } while (currentError);
  };

  /**
   * Find the deepest cause of the given error that corresponds to the given predicate.
   * If no cause nor given error matches the predicate, returns undefined.
   * @param error
   * @param predicate
   * @returns
   */
  export const findCause = <ResultType>(error: unknown, predicate: (e: unknown) => e is ResultType): ResultType | undefined => {
    const causes: (typeof error)[] = [];
    let currentError: typeof error | null | undefined = error;
    do {
      if ((currentError as { cause?: unknown })?.cause === undefined) {
        causes.unshift(error);
        break;
      }
      currentError = (currentError as { cause?: unknown }).cause;
    } while (currentError);
    return causes.find(predicate);
  };

  export const findCode = (error: unknown) => Error.findCause(error, Error.hasCode)?.code;

  export const getAuthErrorText = (type: any, platformUrl: string) => {
    switch (type) {
      case FetchErrorCode.NOT_LOGGED:
        return I18n.get('auth-error-notinitilized');
      case FetchErrorCode.PARSE_ERROR:
      case FetchErrorCode.BAD_RESPONSE:
        return I18n.get('auth-error-badresponse');
      case FetchErrorCode.NETWORK_ERROR:
        return I18n.get('auth-error-networkerror');
      case FetchErrorCode.NOT_OK:
        return I18n.get('auth-error-unknownresponse');
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

      case AccountErrorCode.INVALID_PLATFORM_CONFIG:
        return I18n.get('auth-error-runtimeerror');
      case AccountErrorCode.ACCOUNT_INELIGIBLE_NOT_PREMIUM:
        return I18n.get('auth-error-notpremium');
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
export const useErrorWithKey = (platformUrl: string, error?: Error.WithKey, consumeError?: (errorKey: number) => void) => {
  const [errkey, setErrkey] = React.useState(Error.generateErrorKey);
  const showError = error?.key === errkey || error?.key === undefined;
  const errtype = React.useMemo(() => (showError ? Error.findCode(error?.info) : undefined), [error, showError]);
  const errclear = React.useCallback(() => {
    if (error && showError) setErrkey(Error.generateErrorKey());
  }, [error, showError]);
  const errmsg = React.useMemo(
    () => (showError && error ? Error.getAuthErrorText(errtype, platformUrl) : undefined),
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
