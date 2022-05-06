/**
 * A specific moduleMap that exists inside myAppMenu
 */

import { UnknownNavigableModule, ModuleRegister, setGlobalRegister } from '~/framework/util/moduleTool';

// myApps module register =========================================================================

export const myAppsModules = new ModuleRegister<UnknownNavigableModule>();
setGlobalRegister('myAppsModule', myAppsModules);
