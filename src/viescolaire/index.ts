import { combineReducers } from "redux";

import { registerModule } from "../AppModules";
import config from "./config";
import mainComp from "./navigator";
import viesco from "./viesco/reducers";
import cdt from "./cdt/reducers";
import competences from "./competences/reducers";
import edt from "./edt/reducers";
import presences from "./presences/reducers";

// Main component
export const root = mainComp;

// Reducer
export const reducer = combineReducers({ viesco, cdt, edt, presences, competences });

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
