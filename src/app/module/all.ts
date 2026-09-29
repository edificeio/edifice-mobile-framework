import moduleImports from '~/app/config/modules';

import type { AllModulesArray, AllModulesReducers } from './types';

import type { Module } from '.';

export namespace Modules {
  /**
   * @deprecated
   */
  export const all = moduleImports.map(m => {
    __DEV__ && console.info(`[Module] Loaded module ${m.default.name}.`);
    return m.default;
  }) as AllModulesArray;

  /**
   * @deprecated
   */
  export const allReducers = Object.fromEntries(all.map(module => [module.name, module.redux?.reducer])) as AllModulesReducers;

  /**
   * @deprecated
   */
  export const getAllScopes = () => {
    const scopesByModules = all.map(m => m.scope);
    const set = new Set<string>();
    for (const scopes of scopesByModules) {
      if (!scopes) continue;
      for (const scope of scopes) set.add(scope);
    }
    return set;
  };

  /**
   * @deprecated
   */
  export const getAllOfType = <T extends typeof Module>(type: T): InstanceType<T>[] => {
    return [];
  };
}
