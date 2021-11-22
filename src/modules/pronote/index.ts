import { NavigableModule } from "../../framework/util/moduleTool";
import config from "./moduleConfig";
import getRoot from "./navigator";
import reducer from "./reducers";

export default new NavigableModule({ config, getRoot, reducer });
