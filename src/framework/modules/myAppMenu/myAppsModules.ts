/**
 * A specific moduleMap that exists inside myAppMenu
 */
import { ModuleRegister, ModuleType, setGlobalRegister, UnknownNavigableModule } from '~/framework/util/moduleTool';

// myApps module register =========================================================================

export const myAppsModules = new ModuleRegister<UnknownNavigableModule>();
export const myAppsSecondaryModules = new ModuleRegister<UnknownNavigableModule>();
export const myAppsConnector = new ModuleRegister<UnknownNavigableModule>();
export const myAppsWidgets = new ModuleRegister<UnknownNavigableModule>();

setGlobalRegister(ModuleType.MYAPPS_MODULE, myAppsModules);
setGlobalRegister(ModuleType.MYAPPS_SECONDARY_MODULE, myAppsSecondaryModules);
setGlobalRegister(ModuleType.MYAPPS_CONNECTOR, myAppsConnector);
setGlobalRegister(ModuleType.MYAPPS_WIDGET, myAppsWidgets);
