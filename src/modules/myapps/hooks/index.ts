/**
 * Public API of « Mes applis », for its screens and for the other modules.
 */
export { useAppModules, useEntApp, useEntApps, useModuleApp, useModuleAppName, useOpenApp } from './apps';
export {
  DEFAULT_APP_COLORS,
  DEFAULT_APP_ICON,
  getAppShades,
  getEntAppDisplay,
  useEntAppDisplay,
  useModuleAppDisplay,
} from './display';
export { useFavorites, useFilteredApps, useHasAppsToList, useShowAllApps } from './list';
export type { EntAppDisplay } from './types';
