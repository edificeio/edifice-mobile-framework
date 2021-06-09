/**
 * A specific moduleMap that exists inside myAppMenu
 */

import { AnyNavigableModule, createModuleOrderedSubscription } from "../framework/util/moduleTool";

// myApps module subscription ===================================================================

export const myAppsModules = createModuleOrderedSubscription<AnyNavigableModule>();
