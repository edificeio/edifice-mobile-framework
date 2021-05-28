/**
 * Every module config is imported here.
 */

import { loadModuleConfigMap } from "../util/moduleTool";
import BuiltInModuleConfigs from "../modules/BuiltInModuleConfigs";
import IncludedModuleConfigs from "../../conf/IncludedModuleConfigs";

export default loadModuleConfigMap([
    ...BuiltInModuleConfigs,
    ...IncludedModuleConfigs || []
]);