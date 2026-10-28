import React from 'react';

import { AllModulesReducers, AllModulesStaticModals, AllModulesStaticScreens, CoreModule, useModules, useModulesOfType } from '.';

/**
 * Gather all static screens from modules.
 * @returns
 */
export const useModuleScreens = (): AllModulesStaticScreens => {
  const modules = useModules();
  return React.useMemo(() => Object.assign({}, ...modules.map(module => module.screens)) as AllModulesStaticScreens, [modules]);
};

/**
 * Gather all static modals from modules.
 * @returns
 */
export const useModuleModals = (): AllModulesStaticModals => {
  const modules = useModules();
  return React.useMemo(() => Object.assign({}, ...modules.map(module => module.modals)) as AllModulesStaticModals, [modules]);
};

/**
 * Gather all static screens from modules.
 * @returns
 */
export const useCoreModuleScreens = (): AllModulesStaticScreens => {
  const modules = useModulesOfType(CoreModule);
  return React.useMemo(() => Object.assign({}, ...modules.map(module => module.screens)) as AllModulesStaticScreens, [modules]);
};

/**
 * Gather all static modals from modules.
 * @returns
 */
export const useCoreModuleModals = (): AllModulesStaticModals => {
  const modules = useModulesOfType(CoreModule);
  return React.useMemo(() => Object.assign({}, ...modules.map(module => module.modals)) as AllModulesStaticModals, [modules]);
};

/**
 * Gather the routes of all modules that only host another navigation container, which tracks them itself (`delegatesTelemetry`).
 * @returns
 */
export const useTelemetryDelegatedRoutes = (): ReadonlySet<string> => {
  const modules = useModules();
  return React.useMemo(() => new Set(modules.flatMap(module => [...module.telemetryDelegatedRoutes])), [modules]);
};

/**
 * Retrieves all modules scopes in a set.
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
 * Retrieves all modules in a array.
 * @returns
 */
export const useModuleReducers = (): AllModulesReducers => {
  const modules = useModules();
  if (modules === undefined) throw new Error('[Modules]: `useModuleReducers` was called before all modules could be loaded.');
  return React.useMemo(
    () =>
      Object.fromEntries(
        modules.flatMap(module => (module.redux ? [[module.name, module.redux.reducer]] : [])),
      ) as AllModulesReducers,
    [modules],
  );
};
