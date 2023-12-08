import { IGlobalState, Reducers, getStore } from '~/app/store';
import type {
  AuthErrorDetails,
  AuthLoggedAccount,
  AuthLoggedAccountMap,
  AuthMixedAccountMap,
  IAuthContext,
} from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import createReducer from '~/framework/util/redux/reducerFactory';

import { AuthStorageData } from '../storage';

export interface IAuthState {
  accounts: AuthMixedAccountMap; // account list with populated info
  connected?: keyof IAuthState['accounts']; // Currently logged user if so
  deleted?: keyof IAuthState['accounts']; // Last account was deleted
  showOnboarding: AuthStorageData['showOnboarding'];

  pending?: {
    // Current login task
    account?: keyof IAuthState['accounts']; // If it concerns a saved account, which one
    platform: string; // Platform id of the login task (duplicated the value in `account` if present)
    login?: string; // Manual login only : the login used for log in
    error?: AuthErrorDetails & {
      key?: number;
    };
    activation?: {
      context?: IAuthContext;
      code: string;
    };
  };
}

// Initial state
export const initialState: IAuthState = {
  accounts: {},
  showOnboarding: true,
};

// Actions definitions
export const actionTypes = {
  authInit: moduleConfig.namespaceActionType('INIT'),
  login: moduleConfig.namespaceActionType('LOGIN'),

  // sessionCreate: moduleConfig.namespaceActionType('SESSION_START'),
  // sessionPartial: moduleConfig.namespaceActionType('SESSION_PARTIAL'),
  // sessionRefresh: moduleConfig.namespaceActionType('SESSION_REFRESH'),
  // sessionError: moduleConfig.namespaceActionType('SESSION_ERROR'),
  // sessionErrorConsume: moduleConfig.namespaceActionType('SESSION_ERROR_CONSUME'),
  // sessionEnd: moduleConfig.namespaceActionType('SESSION_END'),
  // redirectAutoLogin: moduleConfig.namespaceActionType('REDIRECT_AUTO_LOGIN'),
  // getLegalDocuments: moduleConfig.namespaceActionType('GET_LEGAL_DOCUMENTS'),
  // profileUpdateRequest: moduleConfig.namespaceActionType('PROFILE_UPDATE_REQUEST'),
  // profileUpdateSuccess: moduleConfig.namespaceActionType('PROFILE_UPDATE_SUCCESS'),
  // profileUpdateError: moduleConfig.namespaceActionType('PROFILE_UPDATE_ERROR'),
};

export interface ActionPayloads {
  authInit: Pick<AuthStorageData, 'accounts' | 'startup' | 'showOnboarding'>;
  login: { id: string; account: AuthLoggedAccount };

  // sessionCreate: Pick<Required<IAuthState>, 'session'>;
  // sessionPartial: Pick<Required<IAuthState>, 'session'>;
  // sessionRefresh: Pick<Required<IAuthState>, 'session'>;
  // sessionError: Pick<Required<IAuthState>, 'error'>;
  // sessionErrorConsume: undefined;
  // sessionEnd: undefined;
  // redirectAutoLogin: Pick<Required<IAuthState>, 'autoLoginResult'>;
  // getLegalDocuments: Pick<Required<IAuthState>, 'legalUrls'>;
  // profileUpdateRequest: { values: Partial<ILoggedUserProfile> };
  // profileUpdateSuccess: { values: Partial<ILoggedUserProfile> };
  // profileUpdateError: undefined;
}

export const actions = {
  authInit: (
    startup: AuthStorageData['startup'],
    accounts: AuthStorageData['accounts'],
    showOnboarding: AuthStorageData['showOnboarding'],
  ) => ({ type: actionTypes.authInit, startup, accounts, showOnboarding }),

  login: (id: string, account: AuthLoggedAccount) => ({ type: actionTypes.login, id, account }),

  // sessionCreate: (session: ISession) => ({ type: actionTypes.sessionCreate, session }),
  // sessionPartial: (session: ISession) => ({ type: actionTypes.sessionPartial, session }),
  // sessionRefresh: (session: ISession) => ({ type: actionTypes.sessionRefresh, session }),
  // sessionError: (error: AuthErrorCode) => ({
  //   type: actionTypes.sessionError,
  //   error,
  // }),
  // sessionErrorConsume: () => ({ type: actionTypes.sessionErrorConsume }),
  // sessionEnd: () => ({ type: actionTypes.sessionEnd }),
  // redirectAutoLogin: (result: ILoginResult) => ({ type: actionTypes.redirectAutoLogin, autoLoginResult: result }),
  // getLegalDocuments: (legalUrls: LegalUrls) => ({ type: actionTypes.getLegalDocuments, legalUrls }),
  // profileUpdateRequest: (values: Partial<ILoggedUserProfile>) => ({ type: actionTypes.profileUpdateRequest, values }),
  // profileUpdateSuccess: (values: Partial<ILoggedUserProfile>) => ({ type: actionTypes.profileUpdateSuccess, values }),
  // profileUpdateError: () => ({ type: actionTypes.profileUpdateError }),
};

const reducer = createReducer(initialState, {
  [actionTypes.authInit]: (state, action) => {
    const { accounts, startup, showOnboarding } = action as unknown as ActionPayloads['authInit'];
    const pending = startup.platform ? { platform: startup.platform } : undefined;
    return { ...initialState, accounts, showOnboarding, pending };
  },

  [actionTypes.login]: (state, action) => {
    const { id, account } = action as unknown as ActionPayloads['login'];
    return { ...state, accounts: { ...state.accounts, [id]: account }, connected: id, showOnboarding: false };
  },

  // // Saves session info & consider user logged
  // [actionTypes.sessionCreate]: (state, action) => {
  //   const { session }: ActionPayloads['sessionCreate'] = action as any;
  //   return { ...initialState, session, logged: true, legalUrls: state.legalUrls };
  // },
  // // Saves session info, NOT consider user logged
  // [actionTypes.sessionPartial]: (state, action) => {
  //   const { session }: ActionPayloads['sessionCreate'] = action as any;
  //   return { ...initialState, session, logged: false, legalUrls: state.legalUrls };
  // },
  // // Saves session info & consider user logged (used for new session built from previous ones)
  // [actionTypes.sessionRefresh]: (state, action) => {
  //   const { session }: ActionPayloads['sessionRefresh'] = action as any;
  //   return { ...initialState, session, logged: true, legalUrls: state.legalUrls };
  // },
  // // Reset auth state plus error
  // [actionTypes.sessionError]: (state, action) => {
  //   const { error }: ActionPayloads['sessionError'] = action as any;
  //   return { ...initialState, error };
  // },
  // // Removes error after it was displayed
  // // Beware of storing the error in the state of the component to control when the error will be hidden
  // [actionTypes.sessionErrorConsume]: (state, action) => {
  //   return { ...state, error: undefined };
  // },
  // [actionTypes.sessionEnd]: (state, action) => {
  //   return { ...initialState, error: state.error }; // Logout preserves error
  // },
  // // Stores the autoLogin result for redirecting user
  // [actionTypes.redirectAutoLogin]: (state, action) => {
  //   const { autoLoginResult }: ActionPayloads['redirectAutoLogin'] = action as any;
  //   return { ...state, autoLoginResult };
  // },
  // // Saves url of platform-dependant documents urls
  // [actionTypes.getLegalDocuments]: (state, action) => {
  //   const { legalUrls }: ActionPayloads['getLegalDocuments'] = action as any;
  //   return { ...state, legalUrls: { ...state.legalUrls, ...legalUrls } };
  // },
  // // Saves changes to user profile values into session
  // [actionTypes.profileUpdateRequest]: (state, action) => state,
  // [actionTypes.profileUpdateSuccess]: (state, action) => {
  //   const { values }: ActionPayloads['profileUpdateSuccess'] = action as any;
  //   if (!state.session) {
  //     return state;
  //   }
  //   return { ...state, session: { ...state.session, user: { ...state.session.user, ...values } } };
  // },
  // [actionTypes.profileUpdateError]: (state, action) => state,
});

Reducers.register(moduleConfig.reducerName, reducer);

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as IAuthState;

/**
 * Get the current active session from Redux state.
 * This is the recommended way to get the session in a component.
 * Though `assertSession` should work, `getSession` does NOT throw exceptions, and return undefined instead,
 * letting you deal with the undefined value as you wish.
 * @returns the active session present in redux state. Can be undefined.
 */
export function getSession() {
  const state = getState(getStore().getState());
  return state.connected ? (state.accounts as AuthLoggedAccountMap)[state.connected] : undefined;
}

/**
 * Get the current active session.
 * This IS NOT the recommended way to get the session information.
 * - In a component, use the below `getSession`
 * - In an action/thunk, use this only if you call your action with tryAction/callAction. Else, use the below `getSession`
 * - In a utility function, use this assertion.
 * Caution : this is an "assert" function. If session not present, this function will throw an error.
 * @returns the current session
 * @throws Error
 */
export function assertSession() {
  const session = getSession();
  if (!session) throw new Error('[assertSession] no session');
  return session;
}

export default reducer;
