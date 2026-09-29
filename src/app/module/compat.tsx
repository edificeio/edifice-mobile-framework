/**
 * Module compatibility layer
 * Integrates with old module system to allow step-by-step migration over the new module system.
 */

import OldModules from '~/app/modules';

import { Modules } from './all';

export const ModuleCompat = {
  getAllModulesScopes: () => {
    const scopes = Modules.getAllScopes();
    const oldScopes = new Set(OldModules().getScopes());
    return scopes.union(oldScopes);
  },

  loadModules: async () => {
    OldModules();
  },
};
