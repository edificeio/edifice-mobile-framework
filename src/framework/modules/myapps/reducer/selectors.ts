import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const selectAppsState = (state: IGlobalState) => {
  return moduleConfig.getState(state) ?? appsInfoInitialState;
};

export const selectAggregatedApps = (state: IGlobalState): AppsInfoAggregated[] => {
  const slice = selectAppsState(state);
  const appsConfig = slice?.appsConfig ?? [];
  const appsInfo = slice?.appsInfo ?? [];

  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo.map(app => {
    const config = configByName.get(app.name);

    return {
      ...app,
      category: config?.category,
      color: config?.color,
      help: config?.help,
      libraries: config?.libraries,
    };
  });
};

export const selectAppsRaw = (state: IGlobalState) => {
  const slice = selectAppsState(state);
  return {
    appsConfig: slice.appsConfig,
    appsInfo: slice.appsInfo,
    entcoreApps: slice.entcoreApps,
  };
};
