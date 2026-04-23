/**
 * Redux store builder
 *
 * Allow modules to register storage namespace in the Redux store.
 *
 * Usage :
 *
 * import { Reducers } from '~/app/store';
 * // Put this line in the entry point of your module.
 * // With this, reducer will be registered automatically if the module is imported somewhere.
 * Reducers.register('REDUCER_NAME', reducer);
 */

import {
  Action,
  applyMiddleware,
  combineReducers,
  compose,
  legacy_createStore as createStore,
  Reducer,
  Store,
  StoreEnhancer,
  UnknownAction,
} from 'redux';
import { thunk, ThunkDispatch } from 'redux-thunk';

import { reducer as startupReducer } from '~/framework/navigation/redux';

import { reactotronEnhancer } from './debug';
import monitorReducerEnhancer from './monitor';
import { ModuleCompat } from '../module/compat';
import { AllModulesState } from '../module/types';

/** === Store reducers map === */

/**
 * @deprecated
 * use the new module system
 */
export class Reducers {
  static $items: { [key: string]: Reducer } = {};

  static register<State, ActionType extends Action>(name: string, item: Reducer<State, ActionType>) {
    this.$items[name] = item as Reducer;
    return item; // Allow chaining
  }

  static get(name: string) {
    if (Object.prototype.hasOwnProperty.call(this.$items.hasOwnProperty, name)) {
      return this.$items[name];
    } else {
      throw new Error(`[Reducers] No reducer of name ${name} has been registred.`);
    }
  }

  static get all() {
    return this.$items as Readonly<typeof this.$items>;
  }

  static clear() {
    this.$items = {};
  }
}

/** === Store getter === */
const theStore: { current?: Store } = { current: undefined };

export default function configureStore(preloadedState?: AllModulesState) {
  const middlewares = [thunk];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = __DEV__ ? [middlewareEnhancer, monitorReducerEnhancer, reactotronEnhancer] : [middlewareEnhancer];
  const composedEnhancers: StoreEnhancer = compose(...enhancers);

  const rootReducer = combineReducers({
    ...ModuleCompat.getAllModulesReducers(),
    // Build-in reducers here
    // ToDo: migrate in new module system (no more specific build-in reducers plz)
    startup: startupReducer,
  });
  const store = createStore(rootReducer, preloadedState, composedEnhancers);
  theStore.current = store;
  return store;
}

/**
 * @deprecated
 * use new module system for reducer that has automatic strict type-checking
 */
export type IGlobalState = any; // Todo: Make any TS logic that can get composed state from module definitions IF POSSIBLE
export type AppDispatch = ThunkDispatch<IGlobalState, unknown, UnknownAction>;

// IMPORTANT ! Do not call this function outside a component rendering.
// This would cause it to be called before all reducers are registered.
export const getStore = () => {
  if (!theStore.current) throw new Error('[Redux] no store !');
  return theStore.current;
};
