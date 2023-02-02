// Tab modules register ===========================================================================
import { AnyNavigableModule, ModuleRegister, setGlobalRegister } from '~/framework/util/moduleTool';


export const tabModules = new ModuleRegister<AnyNavigableModule>();
setGlobalRegister('tabModule', tabModules);