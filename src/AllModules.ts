/**
 * Every module is imported here.
 */

import { loadModuleMap } from "./framework/moduleTool"

export default loadModuleMap([
    ...require("./framework/modules/BuiltInModules").default,
    // Add all modules below
]);