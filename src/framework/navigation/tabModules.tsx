// Tab modules register ===========================================================================
import { AnyNavigableModule, ModuleRegister, setGlobalRegister } from '../util/moduleTool';

export const tabModules = new ModuleRegister<AnyNavigableModule>();
setGlobalRegister('tabModule', tabModules);
