/**
 * How to show an app in the other modules (cards, thumbnails, headers…): its colors, its icon and its label, ready to use.
 */
import React from 'react';

import { AllModulesNames } from '~/app/module';
import theme, { getThemeColorShades, type IShades, type ThemeColorName } from '~/app/theme';
import type { EntApp } from '~/modules/myapps/model';

import { useEntApp, useModuleAppName } from './apps';
import type { EntAppDisplay } from './types';

/** Colors of an app without its own (or unknown). */
export const DEFAULT_APP_COLORS: IShades = theme.palette.primary;

/** Icon of an unknown app. */
export const DEFAULT_APP_ICON = 'ui-infoCircle';

/** The shades of a color of an app (`EntApp.color`), if the palette has all of them (`nabook-color` has only `regular`). */
export const getAppShades = (color: ThemeColorName | undefined): IShades | undefined => getThemeColorShades(color);

/** @param fallbackLabel the label when there is no app. */
export const getEntAppDisplay = (
  app: Pick<EntApp, 'color' | 'icon' | 'label'> | undefined,
  fallbackLabel: string,
): EntAppDisplay => ({
  colors: getAppShades(app?.color) ?? DEFAULT_APP_COLORS,
  icon: app?.icon || DEFAULT_APP_ICON,
  label: app?.label ?? fallbackLabel,
});

/** How to show an app, by its name in the ENT (« Blog », « Communities »…). Its name is the label of an unknown app. */
export const useEntAppDisplay = (entAppName: string | undefined): EntAppDisplay => {
  const app = useEntApp(entAppName);
  return React.useMemo(() => getEntAppDisplay(app, entAppName ?? ''), [app, entAppName]);
};

/**
 * How to show the app of a module, by the name of the module (« blog », « communities »…): the label of its app (translated by the
 * server), else the name of the module (a module without app, such as the test modules). Only a module of the app can be asked
 * (`AllModulesNames`). An available module always has its app loaded: the apps are loaded before the session exists (`sessionSetup`).
 */
export const useModuleAppDisplay = (moduleName: AllModulesNames): EntAppDisplay => {
  const app = useEntApp(useModuleAppName(moduleName));
  return React.useMemo(() => getEntAppDisplay(app, moduleName), [app, moduleName]);
};
