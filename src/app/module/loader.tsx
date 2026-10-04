/**
 * Module Loader
 * Async Component that import all modules than setup providers
 */
import React from 'react';

import moduleImports from '~/app/config/modules';

import { AllModulesArray, AllModulesReducers, AllModulesStaticScreens } from './types';

import { Module } from '.';

/**
 * @deprecated
 * Access staticly to imported modules is dangerous. Instead, call module hooks to get loaded modules into a custom hook.
 */
export let AllModules: AllModulesArray = [] as unknown as AllModulesArray;

const ModuleContext = React.createContext<AllModulesArray | undefined>(undefined);

const loadModules = Promise.all(moduleImports);
export const ModuleLoader = React.memo(function ({ children }: React.PropsWithChildren) {
  // Load all modules
  const modules = React.use(loadModules).map(m => {
    __DEV__ && console.debug(`[Module] Loaded module ${m.default.name}.`);
    return m.default;
  });

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
  const modules = React.useContext(ModuleContext);
  if (modules === undefined) throw new Error('[Modules]: `useModulesOfType` was called before all modules could be loaded.');
  return React.useMemo(() => modules.filter(m => m instanceof type) as InstanceType<T>[], [modules, type]);
};

/**
 * Retrieves all modules in a array.
 * @returns
 */
export const useModuleReducers = (): AllModulesReducers => {
  const modules = React.useContext(ModuleContext);
  if (modules === undefined) throw new Error('[Modules]: `useModuleReducers` was called before all modules could be loaded.');
  return React.useMemo(
    () =>
      Object.fromEntries(
        modules.flatMap(module => (module.redux ? [[module.name, module.redux.reducer]] : [])),
      ) as AllModulesReducers,
    [modules],
  );
};

/**
 * Retrieves all modules in a array.
 * @returns
 */
export const useModuleScopes = (): Set<string> => {
  const modules = useModules();
  return React.useMemo(() => {
    const scopes = new Set<string>();
    modules.forEach(module => {
      module.scope?.forEach(scope => {
        scopes.add(scope);
      });
    });
    return scopes;
  }, [modules]);
};

/**
 * Gather all static screens and modals from modules.
 * @returns
 */
export const useModuleScreens = (): AllModulesStaticScreens => {
  const modules = useModules();
  return React.useMemo(
    () => Object.assign({}, ...modules.flatMap(module => [module.screens, module.modals])) as AllModulesStaticScreens,
    [modules],
  );
};
