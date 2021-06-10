import { tabModules, NavigableModule } from "../../framework/util/moduleTool";
import config from "./moduleConfig";
import getRoot from "./navigator";
import setUpNotifHandlers from "./notifHandler";
import reducer from "./reducers";

export default tabModules.register(
  new NavigableModule({ config, getRoot, reducer }),
  0
);

//setUpNotifHandlers();
