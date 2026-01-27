/**
 * Every module is imported here.
 */
import React from 'react';

import IncludedModules from '~/app/override/modules';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  AnyModule,
  dynamiclyRegisterModules,
  loadModules,
  ModuleArray,
  NavigableModule,
  NavigableModuleArray,
} from '~/framework/util/moduleTool';

// We first imports all modules and their code hierarchy. Registrations are executed,
// and then, we call initModules to instanciate RootComponents for each module.
// The singleton pattern guarantee AllModules will be computed once.
let AllModules: ModuleArray<AnyModule> | undefined;

export default () => {
  if (AllModules) return AllModules;
  else {
    const moduleDeclarations = [
      // Built-in modules
      require('~/framework/modules/auth'),
      require('~/framework/modules/timeline'),
      require('~/framework/modules/audience').default,
      require('~/framework/modules/explorer').default,

      // Included modules from override
      ...(IncludedModules || []),

      // Built-in modules that depends on other
      // CAUTION ! Modules that depends on other (ex myAppMenu) must be listed at the end !
      require('~/framework/modules/myAppMenu'),
    ];
    AllModules = loadModules(moduleDeclarations);
    return AllModules;
  }
};

/**
 * Call this function when all modules have been loaded to init them and register them.
 */
export const setUpModulesAccess = (sessionIfExists?: AuthActiveAccount) => {
  console.info('[BOB] setUpModulesAccess', sessionIfExists, AllModules);
  if (AllModules) {
    if (!sessionIfExists) return [];
    AllModules.initModuleConfigs(sessionIfExists);
    const ret = dynamiclyRegisterModules(AllModules.filter(m => m instanceof NavigableModule) as NavigableModuleArray);
    // We only init module with rights, some without arn't expected to work right (it's a pun 🤭).
    AllModules.filterAvailables(sessionIfExists).initModules(sessionIfExists);
    return ret;
  } else {
    throw new Error('setUpModulesAccess cannot perform until modules are loaded.');
  }
};

export const useAvailableModules = (session?: AuthActiveAccount) =>
  React.useMemo(() => {
    if (!session) return;
    console.info(`[App] Init modules for session: ${session.user.id} (${session.user.login})`);
    if (AllModules) {
      AllModules.initModuleConfigs(session);
      dynamiclyRegisterModules(AllModules.filter(m => m instanceof NavigableModule) as NavigableModuleArray);
      return AllModules.filterAvailables(session).initModules(session);
    } else {
      throw new Error('setUpModulesAccess cannot perform until modules are loaded.');
    }
  }, [session]);
