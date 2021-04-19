/**
 * Every module is imported here.
 */

import { loadModuleMap } from "../util/moduleTool"
import BuiltInModules from "../modules/BuiltInModules";
import IncludedModules from "../../conf/IncludedModules";

export default loadModuleMap([
    ...BuiltInModules,
    ...IncludedModules || []
]);
