import moduleDefinitions from '~/AppModules';
import { getRoutesFromModuleDefinitions } from '~/infra/moduleTool';
import { IAppModule } from '~/infra/moduleTool/types';

export const getRoutes = (modules: IAppModule[], args?: any) => {
  return getRoutesFromModuleDefinitions(modules, args);
};

export const getModules: (filter: (module: IAppModule) => boolean) => IAppModule[] = filter => {
  return moduleDefinitions.filter(filter);
};
