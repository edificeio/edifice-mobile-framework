import { isNavigableModule } from '~/framework/modules/myapps/reducer/adapter';
import { AnyModule, AnyNavigableModule, IEntcoreApp } from '~/framework/util/moduleTool';

export const getAppModule = (app: IEntcoreApp, modules: AnyModule[]): AnyNavigableModule | undefined =>
  modules.filter(isNavigableModule).find(module => module.config.matchEntcoreApp === app.name);

export const getModuleRouteName = (app: IEntcoreApp, modules: AnyModule[]): string | undefined =>
  getAppModule(app, modules)?.config?.routeName;
