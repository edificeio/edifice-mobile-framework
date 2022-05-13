/**
 * Every module is imported here.
 */
import IncludedModules from '~/app/override/modules';
import {
  AnyModule,
  IEntcoreApp,
  IEntcoreWidget,
  ModuleArray,
  NavigableModule,
  NavigableModuleArray,
  dynamiclyRegisterModules,
  loadModules,
} from '~/framework/util/moduleTool';

// We first imports all modules and their code hierarchy. Registrations are executed,
// and then, we call initModules to instanciate RootComponents for each module.
// The singleton pattern guarantee AllModules will be computed once.
let AllModules: ModuleArray<AnyModule> | undefined = undefined;

export default () => {
  if (AllModules) return AllModules;
  else {
    const moduleDeclarations = [
      // Included modules from override
      ...(IncludedModules || []),

      // Built-il modules
      // CAUTION ! Modules that depends on other (ex myAppMenu) must be listed at the end !
      // ToDo: fix me with React Navigation 6
      require('~/framework/modules/timelinev2'),
      require('~/framework/modules/myAppMenu'),
    ];
    // AllModules = dynamiclyRegisterModules(loadModules(moduleDeclarations).initModules());
    AllModules = loadModules(moduleDeclarations);
    return AllModules;
  }
};

/**
 * Call this function when all modules have been loaded to init them and register them.
 */
export const setUpModulesAccess = (entcoreApps: IEntcoreApp[], entcoreWidgets: IEntcoreWidget[]) => {
  if (AllModules) {
    AllModules.initModuleConfigs(entcoreApps, entcoreWidgets);
    const ret = dynamiclyRegisterModules(AllModules.filter(m => m instanceof NavigableModule) as NavigableModuleArray);
    // We only init module with rights, some without arn't expected to work right (it's a pun 🤭).
    AllModules.filterAvailables(entcoreApps, entcoreWidgets).initModules(entcoreApps, entcoreWidgets);
    return ret;
  } else {
    throw new Error('setUpModulesAccess cannot perform until modules are loaded.');
  }
};
