/**
 * Every module is imported here.
 */

import { createModuleMap, initModules } from "../util/moduleTool"
import BuiltInModules from "../modules/BuiltInModules";
import IncludedModules from "../../conf/IncludedModules";

// console.log("AllModules.tsx initModules");
export default createModuleMap(initModules([
    ...BuiltInModules,
    ...IncludedModules || []
]));
