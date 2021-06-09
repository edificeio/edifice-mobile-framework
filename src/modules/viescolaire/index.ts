import { tabModules, NavigableModule } from "../../framework/util/moduleTool";
import config from "./moduleConfig";
import getRoot from "./navigator";
import reducer from "./reducer";

export default tabModules.register(
  new NavigableModule({ config, getRoot, reducer }),
  0
);
