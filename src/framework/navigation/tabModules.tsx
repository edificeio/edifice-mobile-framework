// Tab modules register ===========================================================================
import { AnyNavigableModule, ModuleRegister, ModuleType, setGlobalRegister } from '~/framework/util/moduleTool';

/**
 * @deprecated use new module system instead
 */
export const tabModules = new ModuleRegister<AnyNavigableModule>();
setGlobalRegister(ModuleType.TAB_MODULE, tabModules);

export const computeTabRouteName = (v: string) => `$tab.${v}`;
