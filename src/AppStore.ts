import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import thunkMiddleware from "redux-thunk";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";

import connectionTracker from "./infra/reducers/connectionTracker";
import ui from "./infra/reducers/ui";
import timeline from "./timeline/reducer";
import { IUserInfoState } from "./user/reducers/info";
import { IUserAuthState } from "./user/reducers/auth";

console.log("REDUCERS", getReducersFromModuleDefinitions(moduleDefinitions));

const reducers = {
  connectionTracker,
  ui,
  ...getReducersFromModuleDefinitions(moduleDefinitions)
};

const rootReducer = combineReducers({
  ...reducers,
  timeline // TODO put this in module definitions
});

const enhancer = applyMiddleware(thunkMiddleware);
export const store = window.__REDUX_DEVTOOLS_EXTENSION__ ?
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

export const getSessionInfo = () => ({
  ...(store.getState() as any).user.info
}) as IUserInfoState & IUserAuthState;