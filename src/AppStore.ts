import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import thunkMiddleware from "redux-thunk";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";
import { getModuleReducers } from "./framework/moduleTool";
import AllModules from "./framework/app/AllModules";

import notifiers from "./infra/notifier/reducer";
import connectionTracker from "./infra/reducers/connectionTracker";
import ui from "./infra/reducers/ui";
import progress from "./infra/reducers/progress";
// import timeline from "./timeline/reducer";

declare var window: any;

// console.log("MODULE DEFS ", moduleDefinitions);
// console.log("REDUCERS", getReducersFromModuleDefinitions(moduleDefinitions));

export function createMainStore() {

  console.log("create store");

  const reducers = {
    connectionTracker,
    notifiers,
    ui,
    progress,
    ...getReducersFromModuleDefinitions(moduleDefinitions),
    ...getModuleReducers(AllModules)
  };

  const rootReducer = combineReducers({
    ...reducers,
    // timeline // TODO put this in module definitions
  });

  const enhancer = applyMiddleware(thunkMiddleware);
  const store = window.__REDUX_DEVTOOLS_EXTENSION__ ?
    createStore(
      rootReducer,
      compose(
        enhancer,
        window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    ) :
    createStore(
      rootReducer,
      enhancer
    );

  return store;
}

export type IGlobalState = any; // Todo: Make any TS logic that can get composed state from module definitions IF POSSIBLE
