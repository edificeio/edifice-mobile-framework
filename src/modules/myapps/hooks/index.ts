/**
 * Public API of « Mes applis », for its screens and for the other modules.
 */
export { useAppModules, useEntApp, useEntApps, useModuleApp, useModuleAppName } from './apps';
export {
  DEFAULT_APP_COLORS,
  DEFAULT_APP_ICON,
  getAppShades,
  getEntAppDisplay,
  useEntAppDisplay,
  useModuleAppDisplay,
} from './display';
export { useFavorites, useFilteredApps, useShowAllApps } from './list';
export type { EntAppDisplay } from './types';
