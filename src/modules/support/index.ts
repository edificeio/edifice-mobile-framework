import { NavigableModule } from "../../framework/util/moduleTool";
import { myAppsModules } from "../../myAppMenu/myAppsModules";
import config from "./moduleConfig";
import getRoot from "./navigator";
import reducer from "./reducers";

export default myAppsModules.register(
  new NavigableModule({ config, getRoot, reducer }),
  0
);
