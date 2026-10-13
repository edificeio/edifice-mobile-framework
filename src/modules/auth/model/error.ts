import type { Error } from '~/framework/util/error';

export enum AccountErrorCode {
  /** Invalid or missing platform information */
  INVALID_PLATFORM_CONFIG = 'AuthErrorCode|INVALID_PLATFORM_CONFIG',
  /** Account is not premium */
  ACCOUNT_INELIGIBLE_NOT_PREMIUM = 'AuthErrorCode|ACCOUNT_INELIGIBLE_NOT_PREMIUM',
  /** Account pre-deleted and can only export its data from the web client */
  ACCOUNT_INELIGIBLE_PRE_DELETED = 'AuthErrorCode|ACCOUNT_INELIGIBLE_PRE_DELETED',
  /** Maximum multi-account reached */
  TOO_MANY_ACCOUNTS = 'AuthErrorCode|TOO_MANY_ACCOUNTS',
  /** The data a module needs before the session can start could not be loaded (see `sessionSetup`) */
  SESSION_SETUP_FAILED = 'AuthErrorCode|SESSION_SETUP_FAILED',
}

/**
 * Represents an error specific to account-related operations.
 * Extends the built-in `Error` class and includes an error code.
 *
 * @class AccountError
 * @extends global.Error
 * @implements {Error.WithCode<AccountErrorCode>}
 *
 * @param {AccountErrorCode} code - The specific error code for the account error.
 * @param {...ConstructorParameters<typeof global.Error>} args - Additional arguments passed to the base `Error` constructor.
 */
export class AccountError extends global.Error implements Error.WithCode<AccountErrorCode> {
  constructor(
    public readonly code: AccountErrorCode,
    ...args: ConstructorParameters<typeof global.Error>
  ) {
    super(...args);
    this.name = 'AuthError'; // Note: built-in Error class break the prototype chain when extending it like this...
    Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
    // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
  }
}

/**
 * A module could not load what it needs before the session starts (`sessionSetup`): the sign-in fails, nothing was changed.
 * @param moduleName the module whose setup failed or took too long
 * @param cause what went wrong
 */
export class SessionSetupError extends AccountError {
  constructor(
    public readonly moduleName: string,
    cause?: unknown,
  ) {
    super(AccountErrorCode.SESSION_SETUP_FAILED, `[Auth] The session setup of the module "${moduleName}" failed`, { cause });
    this.name = 'SessionSetupError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
