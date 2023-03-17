import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import moduleDefinitions from './AppModules';
import AppModules from './app/modules';
import { getReducersFromModuleDefinitions } from './infra/moduleTool';
import notifiers from './infra/notifier/reducer';
import connectionTracker from './infra/reducers/connectionTracker';
import progress from './infra/reducers/progress';
import ui from './infra/reducers/ui';

let window: any;

export function createMainStore() {
  const reducers = {
    connectionTracker,
    notifiers,
    ui,
    progress,
    ...getReducersFromModuleDefinitions(moduleDefinitions),
    ...AppModules().getReducers(),
  };

  const rootReducer = combineReducers({
    ...reducers,
  });

  const middlewares = [thunkMiddleware];

  if (__DEV__) {
    const createDebugger = require('redux-flipper').default;
    middlewares.push(createDebugger());
  }

  const enhancer = applyMiddleware(...middlewares);

  const store = window.__REDUX_DEVTOOLS_EXTENSION__
    ? createStore(rootReducer, compose(enhancer, window.__REDUX_DEVTOOLS_EXTENSION__()))
    : createStore(rootReducer, enhancer);

  return store;
}

export type IGlobalState = any; // Todo: Make any TS logic that can get composed state from module definitions IF POSSIBLE
