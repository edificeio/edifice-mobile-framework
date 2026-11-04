/**
 * Public API of « Mes applis »: the apps of the user, and the modules of the app that match them.
 * The apps, the favorites and the modules are three data of their own: these hooks combine them when read (see `model/index.ts`).
 */
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { AllModulesNames, useModule, useUserAvailableModules } from '~/app/module';
import { useCanOpenModule, useOpenModule } from '~/app/navigation-new/open-module';
import { openUrl } from '~/framework/util/linking';
import { useSession } from '~/modules/auth/store/accounts';
import { refreshMyApps } from '~/modules/myapps/actions';
import type { EntApp } from '~/modules/myapps/model';
import { getAppModules, getAppUrl } from '~/modules/myapps/model/opening';
import { selectApps } from '~/modules/myapps/store';

import type { MyAppsDispatch } from './types';

/** Any module of the app: only an `EntModule` may have an app (`matchEntcoreApp`). */
interface ModuleLike {
  name: AllModulesNames;
  entry?: unknown;
}

/** What the rules need to know of a module. */
const toModuleData = (module: ModuleLike) => ({
  hasEntry: module.entry !== undefined,
  matchEntcoreApp: 'matchEntcoreApp' in module && typeof module.matchEntcoreApp === 'string' ? module.matchEntcoreApp : undefined,
  name: module.name,
});

/** All the apps of the user (listed in « Mes applis » or not), their status, and how to load them again. */
export const useEntApps = () => {
  const { data: apps, status } = useSelector(selectApps);
  const dispatch = useDispatch<MyAppsDispatch>();
  const refresh = React.useCallback(() => dispatch(refreshMyApps()), [dispatch]);
  return { apps, refresh, status };
};

/** An app by its name in the ENT (« Blog », « Espace documentaire »…), listed in « Mes applis » or not. */
export const useEntApp = (entAppName: string | undefined): EntApp | undefined => {
  const { data: apps } = useSelector(selectApps);
  return React.useMemo(() => apps.find(app => app.name === entAppName), [apps, entAppName]);
};

/** The module (its name) of each app, by the name of the app, among the modules available for the user that can be opened. */
export const useAppModules = (): ReadonlyMap<string, AllModulesNames> => {
  const modules = useUserAvailableModules();
  return React.useMemo(() => getAppModules(modules.map(toModuleData)), [modules]);
};

/** The name of the app of a module of the app (its `matchEntcoreApp`), if it has one. */
export const useModuleAppName = (moduleName: AllModulesNames): string | undefined =>
  toModuleData(useModule(moduleName)).matchEntcoreApp;

/** The app of a module of the app (by the name of the module), if the user has it. */
export const useModuleApp = (moduleName: AllModulesNames): EntApp | undefined => useEntApp(useModuleAppName(moduleName));

/**
 * Opens an app: its module, if it can be opened (`useCanOpenModule`); else its address in the browser, signed in (`getAppUrl`).
 * Only from a screen of the tabs, as `useOpenModule`.
 */
export const useOpenApp = () => {
  const appModules = useAppModules();
  const canOpenModule = useCanOpenModule();
  const openModule = useOpenModule();
  const session = useSession();
  return React.useCallback(
    (app: Pick<EntApp, 'address' | 'name'>) => {
      const moduleName = appModules.get(app.name);
      if (moduleName !== undefined && canOpenModule(moduleName)) {
        openModule(moduleName);
        return;
      }
      if (session) openUrl(getAppUrl(app.address, session.platform.url));
    },
    [appModules, canOpenModule, openModule, session],
  );
};
