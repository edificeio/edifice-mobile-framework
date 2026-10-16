import { create } from 'zustand';

import {
  accountIsActive,
  AuthActiveAccount,
  type AuthActiveAccountWithRequirement,
  AuthCarbonioUserInfos,
  AuthMixedAccountMap,
  AuthSavedLoggedInAccount,
  AuthTokenSet,
  getSerializedLoggedInAccountInfo,
  getSerializedLoggedOutAccountInfo,
} from '~/modules/auth/model';

type State = {
  /** Every account known by the app : saved ones, and the active one if connected. */
  accounts: AuthMixedAccountMap;
  /** Id of the connected account, if any. The account then is an `AuthActiveAccount`. */
  connected?: string;
  /** Id of the last account removed by the user. If defined, the account selector must be shown even if there is only one account left. */
  lastDeletedAccount?: string;
  /** Timestamp of the last account addition. */
  lastAddAccount: number;
  /**
   * Tells if the welcome screen (onboarding) must be shown.
   * True until the first account is added, then false for ever (even if all the accounts are removed).
   */
  showWelcome: boolean;
};

type Action = {
  /** Replaces the whole state with data read from the storage. */
  hydrate: (accounts: AuthMixedAccountMap, showWelcome: boolean) => void;
  /**
   * Makes the given account the connected one, in place of the saved account of id `accountToReplaceId`.
   * If `accountToReplaceId` is not provided, the account is simply added to the existing ones.
   */
  setAccount: (account: AuthActiveAccount, accountToReplaceId?: string) => void;
  /** Disconnects the connected account and removes its tokens. */
  logout: () => void;
  /** Puts the connected account to sleep : it is disconnected (notifications are off) but keeps its tokens, so it can be woken up later (account switch). */
  sleep: () => void;
  removeAccount: (id: string) => void;
  refreshToken: (id: string, tokens: AuthTokenSet) => void;
  setQueryParamToken: (id: string, token: AuthTokenSet['queryParam']) => void;
  setOneSessionId: (id: string, token: AuthTokenSet['oneSessionId']) => void;
  setCarbonioToken: (id: string, token: AuthTokenSet['carbonioToken']) => void;
  setCarbonioUserInfos: (id: string, userInfos: AuthCarbonioUserInfos) => void;
  updateProfile: (id: string, user: Partial<AuthActiveAccount['user']>) => void;
};

/** Active account, whatever its stage. Prefer `selectSession` or `selectAccountWithRequirement`: this one is for the code that handles both. */
export const selectActiveAccount = (state: State) => {
  const account = state.connected !== undefined ? state.accounts[state.connected] : undefined;
  return accountIsActive(account) ? account : undefined;
};

const withTokens = (state: State, id: string, patch: Partial<AuthTokenSet>): Partial<State> => {
  const account = state.accounts[id] as Partial<AuthActiveAccount | AuthSavedLoggedInAccount> | undefined;
  if (!account?.tokens) return state;
  return {
    accounts: { ...state.accounts, [id]: { ...account, tokens: { ...account.tokens, ...patch } } as AuthMixedAccountMap[string] },
  };
};

export const useAccountsStore = create<State & Action>()(set => ({
  accounts: {},
  connected: undefined,
  hydrate: (accounts, showWelcome) => set({ accounts, connected: undefined, lastDeletedAccount: undefined, showWelcome }),
  lastAddAccount: 0,
  lastDeletedAccount: undefined,
  logout: () =>
    set(state => {
      const account = selectActiveAccount(state);
      if (!account) return state;
      return {
        accounts: { ...state.accounts, [account.user.id]: getSerializedLoggedOutAccountInfo(account) },
        connected: undefined,
        lastDeletedAccount: undefined,
      };
    }),
  refreshToken: (id, tokens) => set(state => withTokens(state, id, tokens)),
  removeAccount: id =>
    set(state => {
      const accounts = { ...state.accounts };
      delete accounts[id];
      return { accounts, connected: state.connected === id ? undefined : state.connected, lastDeletedAccount: id };
    }),
  setAccount: (account, accountToReplaceId) =>
    set(state => {
      const accounts = { ...state.accounts };
      // The addTimestamp (display order) is renewed only for an account that is not among the accounts yet.
      const addTimestamp = accounts[account.user.id]?.addTimestamp ?? account.logTimestamp;
      if (accountToReplaceId !== undefined) delete accounts[accountToReplaceId];
      accounts[account.user.id] = { ...account, addTimestamp };
      return {
        accounts,
        connected: account.user.id,
        lastAddAccount: accountToReplaceId === undefined ? Date.now() : state.lastAddAccount,
        lastDeletedAccount: undefined,
        // Once an account was signed in, the welcome screen is never shown again.
        showWelcome: false,
      };
    }),
  setCarbonioToken: (id, token) => set(state => withTokens(state, id, { carbonioToken: token })),
  setCarbonioUserInfos: (id, carbonioUserInfos) =>
    set(state => {
      const account = state.accounts[id];
      if (!accountIsActive(account)) return state;
      return { accounts: { ...state.accounts, [id]: { ...account, carbonioUserInfos } } };
    }),
  setOneSessionId: (id, token) => set(state => withTokens(state, id, { oneSessionId: token })),
  setQueryParamToken: (id, token) => set(state => withTokens(state, id, { queryParam: token })),
  showWelcome: true,
  sleep: () =>
    set(state => {
      const account = selectActiveAccount(state);
      if (!account) return state;
      return {
        accounts: { ...state.accounts, [account.user.id]: getSerializedLoggedInAccountInfo(account) },
        connected: undefined,
        lastDeletedAccount: undefined,
      };
    }),
  updateProfile: (id, user) =>
    set(state => {
      const account = state.accounts[id];
      if (!accountIsActive(account)) return state;
      return { accounts: { ...state.accounts, [id]: { ...account, user: { ...account.user, ...user } } as AuthActiveAccount } };
    }),
}));

// Selectors

/** The three situations of the connected account, see `flows/index.ts` for the lifecycle. */
export type AuthStage =
  /** No connected account. */
  | 'signedOut'
  /** An account is signed in but has a requirement to fulfill: its session has not started. */
  | 'requirement'
  /** An account is signed in and ready: its session has started. */
  | 'signedIn';

export const selectAuthStage = (state: State): AuthStage => {
  const account = selectActiveAccount(state);
  if (!account) return 'signedOut';
  return account.requirement === undefined ? 'signedIn' : 'requirement';
};

/** The session: the connected account, only if it is signed in AND ready (session started). */
export const selectSession = (state: State) => (selectAuthStage(state) === 'signedIn' ? selectActiveAccount(state) : undefined);

/** The connected account, only if it is signed in with a requirement to fulfill (session not started). */
export const selectAccountWithRequirement = (state: State) =>
  selectAuthStage(state) === 'requirement' ? (selectActiveAccount(state) as AuthActiveAccountWithRequirement) : undefined;

// Hooks

export const useAuthStage = () => useAccountsStore(selectAuthStage);
export const useSession = () => useAccountsStore(selectSession);
export const useAccountWithRequirement = () => useAccountsStore(selectAccountWithRequirement);

// Non-reactive accessors (for services / non-react code)

export const getActiveAccount = () => selectActiveAccount(useAccountsStore.getState());
export const getSession = () => selectSession(useAccountsStore.getState());
export const getAccountWithRequirement = () => selectAccountWithRequirement(useAccountsStore.getState());

export const assertSession = () => {
  const session = getSession();
  if (!session) throw new global.Error('[assertSession] no session');
  return session;
};

export const assertActiveAccount = () => {
  const account = getActiveAccount();
  if (!account) throw new global.Error('[assertActiveAccount] no active account');
  return account;
};
