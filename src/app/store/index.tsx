/**
 * Redux store builder
 */
import React from 'react';

import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore, Store, StoreEnhancer } from 'redux';
import { thunk, ThunkDispatch } from 'redux-thunk';

import { reactotronEnhancer } from './debug';
import monitorReducerEnhancer from './monitor';
import { reducer as startupReducer } from './startup';
import { useModuleReducers } from '../module/loader';
import { AllModulesActions, AllModulesReducers, AllModulesState } from '../module/types';

let _store: Store<AllModulesState, AllModulesActions, unknown> | null = null;
/**
 * @deprecated useSelector + useDispatch only.
 */
export const getStore = () => _store!;
/**
 * ToDo: automatically type the global store
 */
export type IGlobalState = any;
/**
 * ToDo: automatically type the global dispatch + useDispatch
 */
export type AppDispatch = ThunkDispatch<AllModulesState, unknown, AllModulesActions>;

export default function configureStore(reducers: AllModulesReducers, preloadedState?: AllModulesState) {
  const middlewares = [thunk];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = __DEV__ ? [middlewareEnhancer, monitorReducerEnhancer, reactotronEnhancer] : [middlewareEnhancer];
  const composedEnhancers: StoreEnhancer = compose(...enhancers);

  const rootReducer = combineReducers(reducers);
  const store: Store<AllModulesState, AllModulesActions, unknown> = createStore(rootReducer, preloadedState, composedEnhancers);
  return store;
}

export const ReduxProvider = React.memo(function ({ children }: React.PropsWithChildren) {
  const reducers = useModuleReducers();
  // todo: delete startup reducer in favor of suspense-enabled components.
  // @ts-ignore
  const store = React.useMemo(() => configureStore({ ...reducers, startup: startupReducer }), [reducers]);
  _store = store;
  return <Provider store={store}>{children}</Provider>;
});
ReduxProvider.displayName = 'ReduxProvider';
