import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { appsInfoInitialState } from '~/framework/modules/myapps/reducer/reducer';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

export const selectAppsState = (state: IGlobalState) => {
  return moduleConfig.getState(state) ?? appsInfoInitialState;
};

export const selectAggregatedApps = (state: IGlobalState) => {
  const slice = selectAppsState(state);
  const appsConfig = slice?.appsConfig ?? [];
  const appsInfo = slice?.appsInfo ?? [];

  const configByName = new Map(appsConfig.map(c => [c.name, c]));

  return appsInfo.map(app => ({
    ...app,
    config: configByName.get(app.name),
  }));
};

export const selectAppsRaw = (state: IGlobalState) => {
  const slice = selectAppsState(state);

  return {
    appsConfig: slice.appsConfig,
    appsInfo: slice.appsInfo,
    entcoreApps: slice.entcoreApps,
  };
};

export const getAppsInfoForUI = (state: IGlobalState, modules: AnyNavigableModule[]) => {
  const aggregatedApps = selectAggregatedApps(state);
  const { entcoreApps } = selectAppsRaw(state);

  return aggregatedApps.map(app => {
    const entcoreApp = entcoreApps.find(e => e.name === app.name);

    const isMobile = app.type === 'web' && !!entcoreApp && modules.some(m => m.config.matchEntcoreApp?.(entcoreApp, entcoreApps));

    return {
      ...app,
      isMobile,
    };
  });
};
