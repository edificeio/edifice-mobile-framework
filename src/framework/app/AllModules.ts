/**
 * Every module is imported here.
 */

import { dynamiclyRegisterModules, loadModules, ModuleArray, AnyModule } from "../util/moduleTool"
import IncludedModules from "../../conf/IncludedModules";

// We first imports all modules and their code hierarchy. Registrations are executed,
// and then, we call initModules to instanciate RootComponents for each module.
// The singleton pattern guarantee AllModules will be computed once.
let AllModules: ModuleArray<AnyModule> | undefined = undefined;

export default () => {
    if (AllModules) return AllModules;
    else {
        const moduleDeclarations = [
            // Built-il modules
            require("../modules/timelinev2").default,

            // Included modules from override
            ...IncludedModules || []
        ];
        AllModules = dynamiclyRegisterModules(loadModules(moduleDeclarations).initModules());
        return AllModules;
    }
}
