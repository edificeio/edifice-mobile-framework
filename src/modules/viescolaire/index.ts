import { Module, registerTabModule } from "../../framework/util/moduleTool";
import config from "./moduleConfig";
import getMainComp from "./navigator";
import reducer from "./reducer";
import setUpNotifHandlers from "./notifHandler";

export default registerTabModule(
  new Module({
    config, getMainComp, reducer
  }),
  0
);

//setUpNotifHandlers();
