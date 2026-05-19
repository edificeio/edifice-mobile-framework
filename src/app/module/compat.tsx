/**
 * Module compatibility layer
 * Integrates with old module system to allow step-by-step migration over the new module system.
 */

import OldModules from '~/app/modules';
import { Reducers } from '~/app/store';
import connectionTrackerReducer from '~/infra/reducers/connectionTracker';

import { Modules } from './all';

Reducers.register('connectionTracker', connectionTrackerReducer);

export const ModuleCompat = {
  getAllModulesReducers: () => {
    const reducers = Modules.allReducers;
    const oldReducers = Reducers.all;
    return { ...oldReducers, ...reducers };
  },

  getAllModulesScopes: () => {
    const scopes = Modules.getAllScopes();
    const oldScopes = new Set(OldModules().getScopes());
    return scopes.union(oldScopes);
  },

  loadModules: async () => {
    OldModules();
  },
};
