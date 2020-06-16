import config from "./config";

import { combineReducers } from "redux";
import mainComp from "./navigator";
import viesco from "./viesco/reducers";
import cdt from "./cdt/reducers";
import { registerModule } from "../AppModules";

// Main component
export const root = mainComp;

// Reducer
export const reducer = combineReducers({ viesco, cdt });

// Route
export const route = config.createRoute(root);

const module = {
  reducer,
  root,
  route,
};
export default module;

registerModule({
  config: require("./config").default,
  module,
});
