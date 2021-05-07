/**
 * Every module config is imported here.
 */


import BuiltInModuleConfigs from "../modules/BuiltInModuleConfigs";
import IncludedModuleConfigs from "../../conf/IncludedModuleConfigs";
import { createModuleConfigMap } from "../util/moduleTool";

export default createModuleConfigMap([
    ...BuiltInModuleConfigs,
    ...IncludedModuleConfigs || []
]);