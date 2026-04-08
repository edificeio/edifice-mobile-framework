import { isNavigableModule } from '~/framework/modules/myapps/reducer/adapter';
import { AnyModule, IEntcoreApp } from '~/framework/util/moduleTool';

export const getModuleRouteName = (app: IEntcoreApp, modules: AnyModule[]): string | undefined => {
  const navigableModules = modules.filter(isNavigableModule);

  const matchedModule = navigableModules.find(module => module.config.matchEntcoreApp(app));

  return matchedModule?.config?.routeName;
};
