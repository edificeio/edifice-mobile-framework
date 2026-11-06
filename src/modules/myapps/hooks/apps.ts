/**
 * Public API of « Mes applis »: the apps of the user, and the modules of the app that match them.
 * The apps, the favorites and the modules are three data of their own: these hooks combine them when read (see `model/index.ts`).
 */
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { AllModulesNames, useModule, useUserAvailableModules } from '~/app/module';
import { refreshMyApps } from '~/modules/myapps/actions';
import type { AppModule, EntApp } from '~/modules/myapps/model';
import { getAppModules } from '~/modules/myapps/model/opening';
import { selectApps } from '~/modules/myapps/store';
import { I18n } from '~/util/i18n';

import type { MyAppsDispatch } from './types';

/** Translates like `I18n.get`, for the rules (`Translate`). */
export const translate = (key: string) => I18n.get(key);

/** Any module: only an `EntModule` may have an app (`matchEntcoreApp`). */
interface ModuleLike {
  name: string;
  entry?: unknown;
}

/** What the rules need to know of a module. */
const toModuleData = (module: ModuleLike) => ({
  entry: typeof module.entry === 'string' ? module.entry : undefined,
  matchEntcoreApp: 'matchEntcoreApp' in module && typeof module.matchEntcoreApp === 'string' ? module.matchEntcoreApp : undefined,
  name: module.name,
});

/** All the apps of the user (listed in « Mes applis » or not), their status, and how to load them again. */
export const useEntApps = () => {
  const { data: apps, status } = useSelector(selectApps);
  const dispatch = useDispatch<MyAppsDispatch>();
  const refresh = React.useCallback(() => dispatch(refreshMyApps({ translate })), [dispatch]);
  return { apps, refresh, status };
};

/** An app by its name in the ENT (« Blog », « Espace documentaire »…), listed in « Mes applis » or not. */
export const useEntApp = (entAppName: string | undefined): EntApp | undefined => {
  const { data: apps } = useSelector(selectApps);
  return React.useMemo(() => apps.find(app => app.name === entAppName), [apps, entAppName]);
};

/** The module of each app (by the name of the app), among the modules available for the user. */
export const useAppModules = (): ReadonlyMap<string, AppModule> => {
  const modules = useUserAvailableModules();
  return React.useMemo(() => getAppModules(modules.map(toModuleData)), [modules]);
};

/** The name of the app of a module of the app (its `matchEntcoreApp`), if it has one. */
export const useModuleAppName = (moduleName: AllModulesNames): string | undefined =>
  toModuleData(useModule(moduleName)).matchEntcoreApp;

/** The app of a module of the app (by the name of the module), if the user has it. */
export const useModuleApp = (moduleName: AllModulesNames): EntApp | undefined => useEntApp(useModuleAppName(moduleName));
