/**
 * Auth flows: the public use cases of the module, the ones to call from the outside.
 * Each one orchestrates services (network), stores (state, persisted by the accounts store) and side effects (notifications...).
 *
 * # Lifecycle of the connected account (`AuthStage`, see `store/accounts.ts`)
 *
 *   signedOut --sign in--> requirement --fulfilled--> signedIn
 *        |                                                ^
 *        +------------------ sign in (no requirement) ----+
 *
 * - `signedOut`: no connected account.
 * - `requirement`: the account is signed in and saved, but the platform asks something first (new terms, new password...).
 *   Only one requirement at a time, the first one the service finds (`service/requirements.ts`). Its session has NOT started:
 *   the effects of `startSession` did not run (notifications, apps, `callAtLogin` callbacks...), and only auth screens can show.
 *   Once the user did what is asked, `refreshRequirements` checks again: either another requirement comes, or none is left.
 * - `signedIn`: the session started (`startSession`) and the app can be used. Use `getSession()` to get it:
 *   it returns nothing before that, so code that needs a session never gets an unfinished one.
 *   Only code that must handle both (logout, requirement screens) uses `getConnectedAccount()`.
 */

export { changeRequiredPassword } from './change-required-password';
export { logout } from './logout';
export { refreshAccountToken } from './refresh-token';
export { refreshOneSessionId } from './refresh-one-session-id';
export { refreshQueryParamToken } from './refresh-query-param-token';
export { refreshRequirements } from './refresh-requirements';
export { removeAccount } from './remove-account';
export { setAccount } from './set-account';
export { restoreAccount } from './restore-account';
export { restoreAtStartup } from './startup';
export { revalidateTerms } from './revalidate-terms';
export { switchAccount } from './switch-account';
