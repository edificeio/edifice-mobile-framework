import supportConfig from "./config";
import mainComp from "./navigator";
import mainReducer from "./reducers";
import { registerModule } from "../AppModules";

// Main component
export const root = mainComp;

// Reducer
export const reducer = mainReducer;

// Route
export const route = supportConfig.createRoute(root);

const module = {
  reducer,
  root,
  route,
};
export default module;

registerModule(
  {
    config: require("./config").default,
    module
  }
)
