/*
  Reducers for User app and authentification.
*/

import { Action, combineReducers } from "redux";

import auth from "./auth";
import info from "./info";

const rootReducer: (state: any, action: Action) => any = combineReducers({
  auth,
  info
});

export default rootReducer;
