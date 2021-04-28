/**
 * Every module config is imported here.
 */

import { loadModuleConfigMap } from "./framework/moduleTool";

export default loadModuleConfigMap([
    ...require("./framework/modules/BuiltInModuleConfigs").default,
    // Add all module configs below
]);