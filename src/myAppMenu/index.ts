import myAppConfig from "./config";

import mainComp from "./navigator";
import { registerModule } from "../AppModules";

// Main component
export const root = mainComp;

// Reducer
const reducer = () => null;

// Route
export const getRoute = myAppConfig.createFunctionRoute(root);

const module = {
  reducer,
  root,
  getRoute
};
export default module;

registerModule(
  {
    order: 4,
    config: require("./config").default,
    module
  }
)
