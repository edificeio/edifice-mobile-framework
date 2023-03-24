import { IGlobalState, Reducers, getStore } from '~/app/store';
import { ILoginResult } from '~/framework/modules/auth/actions';
import type { AuthErrorCode, ISession, LegalUrls } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/moduleConfig';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type
export interface IAuthState {
  error?: AuthErrorCode; // Next error to be displayed
  session?: ISession; // Session info
  logged: boolean; // true indicated user is considered as logged. Keep false until the entire authentication is vali, even if session was retrieved.
  autoLoginResult?: ILoginResult; // used to pass loginResult to navigation when it's autoLogin
  legalUrls?: LegalUrls; // urls of platform-dependant documents
}

// Initial state
export const initialState: IAuthState = {
  logged: false,
};

// Actions definitions
export const actionTypes = {
  sessionCreate: moduleConfig.namespaceActionType('SESSION_START'),
  sessionPartial: moduleConfig.namespaceActionType('SESSION_PARTIAL'),
  sessionRefresh: moduleConfig.namespaceActionType('SESSION_REFRESH'),
  sessionError: moduleConfig.namespaceActionType('SESSION_ERROR'),
  sessionErrorConsume: moduleConfig.namespaceActionType('SESSION_ERROR_CONSUME'),
  sessionEnd: moduleConfig.namespaceActionType('SESSION_END'),
  redirectAutoLogin: moduleConfig.namespaceActionType('REDIRECT_AUTO_LOGIN'),
  getLegalDocuments: moduleConfig.namespaceActionType('GET_LEGAL_DOCUMENTS'),
};

export interface ActionPayloads {
  sessionCreate: Pick<Required<IAuthState>, 'session'>;
  sessionPartial: Pick<Required<IAuthState>, 'session'>;
  sessionRefresh: Pick<Required<IAuthState>, 'session'>;
  sessionError: Pick<Required<IAuthState>, 'error'>;
  sessionErrorConsume: undefined;
  sessionEnd: undefined;
  redirectAutoLogin: Pick<Required<IAuthState>, 'autoLoginResult'>;
  getLegalDocuments: Pick<Required<IAuthState>, 'legalUrls'>;
}

export const actions = {
  sessionCreate: (session: ISession) => ({ type: actionTypes.sessionCreate, session }),
  sessionPartial: (session: ISession) => ({ type: actionTypes.sessionPartial, session }),
  sessionRefresh: (session: ISession) => ({ type: actionTypes.sessionRefresh, session }),
  sessionError: (error: AuthErrorCode) => ({
    type: actionTypes.sessionError,
    error,
  }),
  sessionErrorConsume: () => ({ type: actionTypes.sessionErrorConsume }),
  sessionEnd: () => ({ type: actionTypes.sessionEnd }),
  redirectAutoLogin: (result: ILoginResult) => ({ type: actionTypes.redirectAutoLogin, autoLoginResult: result }),
  getLegalDocuments: (legalUrls: LegalUrls) => ({ type: actionTypes.getLegalDocuments, legalUrls }),
};

const reducer = createReducer(initialState, {
  // Saves session info & consider user logged
  [actionTypes.sessionCreate]: (state, action) => {
    const { session }: ActionPayloads['sessionCreate'] = action as any;
    return { ...initialState, session, logged: true, legalUrls: state.legalUrls };
  },
  // Saves session info, NOT consider user logged
  [actionTypes.sessionPartial]: (state, action) => {
    const { session }: ActionPayloads['sessionCreate'] = action as any;
    return { ...initialState, session, logged: false, legalUrls: state.legalUrls };
  },
  // Saves session info & consider user logged (used for new session built from previous ones)
  [actionTypes.sessionRefresh]: (state, action) => {
    const { session }: ActionPayloads['sessionRefresh'] = action as any;
    return { ...initialState, session, logged: true, legalUrls: state.legalUrls };
  },
  // Reset auth state plus error
  [actionTypes.sessionError]: (state, action) => {
    const { error }: ActionPayloads['sessionError'] = action as any;
    return { ...initialState, error };
  },
  // Removes error after it was displayed
  // Beware of storing the error in the state of the component to control when the error will be hidden
  [actionTypes.sessionErrorConsume]: (state, action) => {
    return { ...state, error: undefined };
  },
  [actionTypes.sessionEnd]: (state, action) => {
    return { ...initialState, error: state.error }; // Logout preserves error
  },
  // Stores the autoLogin result for redirecting user
  [actionTypes.redirectAutoLogin]: (state, action) => {
    const { autoLoginResult }: ActionPayloads['redirectAutoLogin'] = action as any;
    return { ...state, autoLoginResult };
  },
  // Saves url of platform-dependant documents urls
  [actionTypes.getLegalDocuments]: (state, action) => {
    const { legalUrls }: ActionPayloads['getLegalDocuments'] = action as any;
    return { ...state, legalUrls: { ...state.legalUrls, ...legalUrls } };
  },
});

Reducers.register(moduleConfig.reducerName, reducer);

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as IAuthState;

/**
 * Get the current active session.
 * This IS NOT the recommended way to get the session information.
 * - In a component, use the below `getSession`
 * - In an action/thunk, use this only if you call your action with tryActionLegacy. Else, use the below `getSession`
 * - In a utility function, use this assertion.
 * Caution : this is an "assert" function. If session not present, this function will throw an error.
 * @returns the current session
 */
export function assertSession() {
  const session = getState(getStore().getState()).session;
  if (!session) throw new Error('[assertSession] no session');
  return session;
}

/**
 * Get the current active session from Redux state.
 * This is the recommended way to get the session in a component.
 * Though `assertSession` should work, `getSession` does NOT throw exceptions, and return undefined instead,
 * letting you deal with the undefined value as you wish.
 * @returns the active session present in redux state. Can be undefined.
 */
export function getSession() {
  return getState(getStore().getState()).session;
}

export default reducer;
