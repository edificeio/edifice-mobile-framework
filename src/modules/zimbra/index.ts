import config from './moduleConfig';
import getMainComp from './navigator';
import reducer from './reducers';
import setUpNotifHandlers from './notifHandler';
import { Module, createModuleConfig, registerTabModule } from "../../framework/util/moduleTool";

export default registerTabModule(
  new Module({
    config, getMainComp, reducer
  })
);

//setUpNotifHandlers();

/*import zimbraConfig from "./config";
import mainComp from "./navigator";
import mainReducer from "./reducers";
import { registerModule } from "../AppModules";

// Main component
export const root = mainComp;

// Reducer
export const reducer = mainReducer;

// Route
export const route = zimbraConfig.createRoute(root);

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
*/