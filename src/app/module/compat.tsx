/**
 * Module compatibility layer
 * Integrates with old module system to allow step-by-step migration over the new module system.
 *  @todo: remove this file after the migration.
 */

/**
 * @deprecated
 * New module system & static navigation available. See docs.
 */
export const ModuleCompat = {
  getAllModulesScopes: () => new Set(),

  loadModules: async () => [],
};
