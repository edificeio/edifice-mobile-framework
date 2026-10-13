/**
 * Hooks to read the session and the stage of the connected account. Public: other modules import them from here
 * (`~/modules/auth/hooks/use-session`). They live in the accounts store, which stays internal.
 *
 * - `useSession()`: the connected account, ONLY once its session started (stage `signedIn`). `undefined` otherwise.
 * - `useAuthStage()`: `'signedOut' | 'requirement' | 'signedIn'`.
 * - `useAccountWithRequirement()`: the connected account while it has a requirement to fulfill (session not started).
 * To render a component that needs a session, prefer `withSession` (`~/modules/auth/hoc/with-session`).
 */
export { useAccountWithRequirement, useAuthStage, useSession } from '~/modules/auth/store/accounts';
