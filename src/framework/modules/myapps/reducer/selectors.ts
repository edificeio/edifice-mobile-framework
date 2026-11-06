import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AppsInfoState } from '~/framework/modules/myapps/types';

/**
 * The state of the former module. `myapps` is now the reducer of `src/modules/myapps`, which has another shape: read as empty, as it
 * was while no reducer was registered under this name.
 * ToDo(myapps-migration): phase 3, rewrite these selectors as facades over `src/modules/myapps`.
 */
export const selectAppsState = (state: IGlobalState): AppsInfoState => {
  const moduleState = moduleConfig.getState(state) as Partial<AppsInfoState> | undefined;
  return moduleState?.aggregatedApps ? (moduleState as AppsInfoState) : appsInfoInitialState;
};
export const selectAppBookmarks = (state: IGlobalState) => selectAppsState(state).favorites;
export const selectAggregatedApps = (state: IGlobalState) => selectAppsState(state).aggregatedApps;
