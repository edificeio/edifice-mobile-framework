/**
 * Redux store of « Mes applis » (see `MyAppsState`). Emptied when the session ends.
 */
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import { MyAppsAction, myAppsActionTypes } from './action-creators';
import { initialState, MyAppsState } from './state';

/** The action of a type: a handler only gets the actions of its type. */
type ActionOf<Type extends MyAppsAction['type']> = Extract<MyAppsAction, { type: Type }>;

// The reducer gets every action of the app (not only `MyAppsAction`): redux types the store from reducers that accept any action
const reducer = createSessionReducer<MyAppsState>(initialState, {
  [myAppsActionTypes.appsLoaded]: (state, action) => ({
    ...state,
    apps: { data: (action as ActionOf<typeof myAppsActionTypes.appsLoaded>).data, status: 'loaded' },
  }),
  // The apps already loaded stay: an error only tells the screen
  [myAppsActionTypes.appsFailed]: state => ({ ...state, apps: { ...state.apps, status: 'error' } }),
  [myAppsActionTypes.preferencesLoaded]: (state, action) => ({
    ...state,
    preferences: { data: (action as ActionOf<typeof myAppsActionTypes.preferencesLoaded>).data, status: 'loaded' },
  }),
  [myAppsActionTypes.preferencesFailed]: state => ({ ...state, preferences: { ...state.preferences, status: 'error' } }),
  [myAppsActionTypes.onboardingShown]: state => ({ ...state, onboardingShown: true }),
});

export default reducer;

export * from './action-creators';
export * from './selectors';
export * from './state';
