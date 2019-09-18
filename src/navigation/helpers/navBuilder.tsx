import moduleDefinitions from "../../AppModules";

import { getRoutesFromModuleDefinitions, IAppModule } from "../../infra/moduleTool";

export const getRoutes = (modules: IAppModule[]) => {
  return getRoutesFromModuleDefinitions(modules);
};

export const getModules: (filter: (module: IAppModule) => boolean) => IAppModule[] = filter => {
  return moduleDefinitions.filter(filter);
};
