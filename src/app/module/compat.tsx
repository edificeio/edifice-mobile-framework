/**
 * Module compatibility layer
 * Integrates with old module system to allow step-by-step migration over the new module system.
 */

import { Module } from '.';
import OldModules from '~/app/modules';
import { Reducers } from '~/app/store';

export const ModuleCompat = {
  getAllModulesScopes: () => {
    const scopes = Module.getAllModulesScopes();
    const oldScopes = new Set(OldModules().getScopes());
    return scopes.union(oldScopes);
  },

  getAllModulesReducers: () => {
    const reducers = Module.getAllModulesReducers();
    const oldReducers = Reducers.all;
    return { ...oldReducers, ...reducers };
  },
};
