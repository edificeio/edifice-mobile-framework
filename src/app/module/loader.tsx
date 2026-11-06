/**
 * Module Loader
 * Async Component that import all modules than setup providers
 */
import React from 'react';

import moduleImports from '~/app/config/modules';

import { AllModulesArray, AllModulesNames, AllModulesRecord, AnyModule, AnyTabModule, Module } from '.';

/**
 * @deprecated
 * Access staticly to imported modules is dangerous. Instead, call module hooks to get loaded modules into a custom hook.
 */
export let AllModules: AllModulesArray = [] as unknown as AllModulesArray;

/** The loaded modules (context of `ModuleLoader`): in an array (in the order of `~/app/config/modules`), and by name (O(1)). */
interface LoadedModules {
  modules: Readonly<AllModulesArray>;
  record: Readonly<AllModulesRecord>;
}

const ModuleContext = React.createContext<LoadedModules | undefined>(undefined);

// Built once, outside of the renders: what depends on the modules (the session lifecycle of auth) needs a stable array
const loadModules = Promise.all(moduleImports).then((imported): LoadedModules => {
  const modules = imported.map(m => {
    __DEV__ && console.debug(`[Module] Loaded module ${m.default.name}.`);
    return m.default;
  }) as AllModulesArray;
  const record = Object.freeze(Object.fromEntries(modules.map(module => [module.name, module]))) as AllModulesRecord;
  return { modules: Object.freeze(modules), record };
});
export const ModuleLoader = React.memo(function ({ children }: React.PropsWithChildren) {
  // Load all modules
  const loaded = React.use(loadModules);
  return <ModuleContext value={loaded}>{children}</ModuleContext>;
});
ModuleLoader.displayName = 'ModuleLoader';

/**
 * Retrieves all modules in a array.
 * @returns
 */
const useLoadedModules = (): LoadedModules => {
  const loaded = React.useContext(ModuleContext);
  if (loaded === undefined) throw new Error('[Modules]: the modules were read before all of them could be loaded.');
  return loaded;
};

export const useModules = (): Readonly<AllModulesArray> => useLoadedModules().modules;

/**
 * All the modules by name (same object as long as the app runs): `useModulesRecord().myapps` is the module `myapps`, with its type.
 * For a name that comes from data (a `string`), use `getModuleByName`.
 */
export const useModulesRecord = () => useLoadedModules().record;

/** A module by any name (from data…), in O(1): only a module of the app, not a property inherited by the object (« toString »…). */
export const getModuleByName = (record: Readonly<AllModulesRecord>, name: string): AnyModule | undefined =>
  Object.prototype.hasOwnProperty.call(record, name) ? record[name as AllModulesNames] : undefined;

/**
 * A module by its name, in O(1).
 * - With the name of a module of the app (typed): that module.
 * - With any other name (from data): the module, if one is loaded under that name.
 */
export function useModule<Name extends AllModulesNames>(name: Name): AllModulesRecord[Name];
export function useModule(name: string | undefined): AnyModule | undefined;
export function useModule(name: string | undefined): AnyModule | undefined {
  const record = useModulesRecord();
  return name === undefined ? undefined : getModuleByName(record, name);
}

/**
 * Retrieves all modules of a certain subclass in a array.
 * @returns
 */
export const useModulesOfType = <T extends typeof Module>(type: T): InstanceType<T>[] => {
  const modules = useModules();
  return React.useMemo(() => modules.filter(m => m instanceof type) as InstanceType<T>[], [modules, type]);
};

/**
 * Retrieves all modules that are displayed in the tab bar.
 * @returns
 */
export const useTabModules = (): AnyTabModule[] => {
  const modules = useModules();
  return React.useMemo(() => modules.filter(module => module.tab !== undefined) as unknown as AnyTabModule[], [modules]);
};
