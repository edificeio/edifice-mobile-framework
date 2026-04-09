import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';

export const selectAppsState = (state: IGlobalState) => moduleConfig.getState(state) ?? appsInfoInitialState;
export const selectAppBookmarks = (state: IGlobalState) => selectAppsState(state).favorites;
export const getAllappsShowedState = (state: IGlobalState) => Boolean(selectAppsState(state).showAllApps);
export const selectAggregatedApps = (state: IGlobalState) => selectAppsState(state).aggregatedApps;
