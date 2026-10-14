import { create } from 'zustand';

import {
  accountIsActive,
  AuthActiveAccount,
  AuthCarbonioUserInfos,
  AuthMixedAccountMap,
  AuthRequirement,
  AuthSavedLoggedInAccount,
  AuthTokenSet,
  getSerializedLoggedInAccountInfo,
  getSerializedLoggedOutAccountInfo,
} from '../model';

type State = {
  /** Every account known by the app : saved ones, and the active one if connected. */
  accounts: AuthMixedAccountMap;
  /** Id of the connected account, if any. The account then is an `AuthActiveAccount`. */
  connected?: string;
  /** Id of the last account removed by the user. If defined, the account selector must be shown even if there is only one account left. */
  lastDeletedAccount?: string;
  /** Timestamp of the last account addition. */
  lastAddAccount: number;
};

type Action = {
  /** Replaces the whole state with data read from the storage. */
  hydrate: (accounts: AuthMixedAccountMap) => void;
  /**
   * Makes the given account the connected one, in place of the saved account of id `replacedId`.
   * If `replacedId` is not provided, the account is simply added to the existing ones.
   */
  setAccount: (account: AuthActiveAccount, replacedId?: string) => void;
  /** Replaces the connected account with a fresher version of it (e.g. after its requirement was refreshed). */
  updateSession: (account: AuthActiveAccount) => void;
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

const getConnected = (state: State) => {
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
  hydrate: accounts => set({ accounts, connected: undefined, lastDeletedAccount: undefined }),
  lastAddAccount: 0,
  lastDeletedAccount: undefined,
  logout: () =>
    set(state => {
      const account = getConnected(state);
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
  setAccount: (account, replacedId) =>
    set(state => {
      const accounts = { ...state.accounts };
      if (replacedId !== undefined) delete accounts[replacedId];
      accounts[account.user.id] = account;
      return {
        accounts,
        connected: account.user.id,
        lastAddAccount: replacedId === undefined ? Date.now() : state.lastAddAccount,
        lastDeletedAccount: undefined,
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
  sleep: () =>
    set(state => {
      const account = getConnected(state);
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
  updateSession: account =>
    set(state => (state.connected === account.user.id ? { accounts: { ...state.accounts, [account.user.id]: account } } : state)),
}));

// Selectors

/** Connected account, even if it still has a requirement to fulfill. */
export const selectSession = (state: State) => getConnected(state);

/** Tells if the user is signed in AND ready to navigate in the app : a connected account with no requirement left. */
export const selectIsSignedInAndReady = (state: State) => {
  const session = getConnected(state);
  return session !== undefined && session.requirement === undefined;
};

export const selectRequirement = (state: State): AuthRequirement | undefined => getConnected(state)?.requirement;

// Hooks

export const useSession = () => useAccountsStore(selectSession);
export const useRequirement = () => useAccountsStore(selectRequirement);

// Non-reactive accessors (for services / non-react code)

export const getSession = () => selectSession(useAccountsStore.getState());

export const assertSession = () => {
  const session = getSession();
  if (!session) throw new global.Error('[assertSession] no session');
  return session;
};
