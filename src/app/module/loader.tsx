/**
 * Module Loader
 * Async Component that import all modules than setup providers
 */
import React from 'react';

import moduleImports from '~/app/config/modules';

import { AllModulesArray, AnyEntTabModule, EntModule, Module } from '.';

/**
 * @deprecated
 * Access staticly to imported modules is dangerous. Instead, call module hooks to get loaded modules into a custom hook.
 */
export let AllModules: AllModulesArray = [] as unknown as AllModulesArray;

const ModuleContext = React.createContext<AllModulesArray | undefined>(undefined);

// Built once, outside of the renders: what depends on the modules (the session lifecycle of auth) needs a stable array
const loadModules = Promise.all(moduleImports).then(imported =>
  imported.map(m => {
    __DEV__ && console.debug(`[Module] Loaded module ${m.default.name}.`);
    return m.default;
  }),
);
export const ModuleLoader = React.memo(function ({ children }: React.PropsWithChildren) {
  // Load all modules
  const modules = React.use(loadModules);
  return <ModuleContext value={modules}>{children}</ModuleContext>;
});
ModuleLoader.displayName = 'ModuleLoader';

/**
 * Retrieves all modules in a array.
 * @returns
 */
export const useModules = (): AllModulesArray => {
  const modules = React.useContext(ModuleContext);
  if (modules === undefined) throw new Error('[Modules]: `useModules` was called before all modules could be loaded.');
  return modules;
};

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
export const useTabModules = (): AnyEntTabModule[] => {
  const modules = useModules();
  return React.useMemo(
    () => modules.filter(module => module instanceof EntModule && module.tab !== undefined) as unknown as AnyEntTabModule[],
    [modules],
  );
};
