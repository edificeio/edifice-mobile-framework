import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/mesappli/module-config';
import { appsInfoInitialState } from '~/framework/modules/mesappli/reducer/reducer';

export const selectAppsState = (state: IGlobalState) => {
  console.debug('[selectAppsState]', {
    reducerName: moduleConfig.reducerName,
    storeKeys: Object.keys(state),
  });

  return moduleConfig.getState(state) ?? appsInfoInitialState;
};

export const selectAggregatedApps = (state: IGlobalState) => {
  const slice = selectAppsState(state);
  console.debug('APP_SLICES', slice);
  const appsConfig = slice?.appsConfig ?? [];
  const appsInfo = slice?.appsInfo ?? [];

  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo.map(app => ({
    ...app,
    config: configByName.get(app.name),
  }));
};
