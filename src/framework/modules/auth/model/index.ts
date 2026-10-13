import type { AuthActiveAccount } from '~/modules/auth/model';

/**
 * @deprecated moved to `~/modules/auth/model`.
 */
export * from '~/modules/auth/model';

/**
 * Every info the logged account contains.
 *
 * @deprecated use `AuthActiveAccount` instead.
 * ⚠️ Do NOT confuse with `AuthLoggedAccount` of `~/modules/auth/model`: in the new model it means "active account OR saved account with tokens".
 * This alias is kept with its former meaning (= `AuthActiveAccount`) for the not yet migrated modules only.
 */
export type AuthLoggedAccount = AuthActiveAccount;
