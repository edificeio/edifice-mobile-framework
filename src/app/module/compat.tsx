/**
 * Module compatibility layer
 * Integrates with old module system to allow step-by-step migration over the new module system.
 */

import OldModules from '~/app/modules';
import { Reducers } from '~/app/store';
import connectionTrackerReducer from '~/infra/reducers/connectionTracker';

import { Module } from '.';

Reducers.register('connectionTracker', connectionTrackerReducer);

export const ModuleCompat = {
  getAllModulesReducers: () => {
    const reducers = Module.getAllModulesReducers();
    const oldReducers = Reducers.all;
    return { ...oldReducers, ...reducers };
  },

  getAllModulesScopes: () => {
    const scopes = Module.getAllModulesScopes();
    const oldScopes = new Set(OldModules().getScopes());
    return scopes.union(oldScopes);
  },

  loadModules: async () => {
    OldModules();
    return Module.loadModules();
  },
};
