import { getSession } from '~/modules/auth/store/accounts';

/**
 * Not reactive : reads zustand whenever the redux store updates.
 * @deprecated use `useSession()` from `~/modules/auth/store/accounts`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const session = (_state?: unknown) => getSession();

/**
 * Not reactive : reads zustand whenever the redux store updates.
 * @deprecated use `useSession()?.tokens.oneSessionId` from `~/modules/auth/store/accounts`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const oneSessionId = (_state?: unknown) => getSession()?.tokens.oneSessionId;
