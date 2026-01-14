import { AppsInfo, AppsInfoAggregated, MyAppsCategories } from '~/framework/modules/myapps/types';
import { AnyModule, AnyNavigableModule, IEntcoreApp } from '~/framework/util/moduleTool';

const HTTP_REGEX: RegExp = /^https?:\/\//i;

export const resolveAppCategory = (app: AppsInfoAggregated): MyAppsCategories => {
  if (!app.isMobile) {
    return 'servicesExternes';
  }

  switch (app.category) {
    case 'communication':
      return 'communication';

    case 'pedagogy':
      return 'pedagogie';

    case 'organisation':
      return 'organisation';

    default:
      return 'servicesExternes';
  }
};

export const isNavigableModule = (module: AnyModule): module is AnyNavigableModule => {
  return typeof (module as AnyNavigableModule).getRoot === 'function';
};

export const isConnectorApp = (app: IEntcoreApp): boolean => {
  return app.isExternal === true || app.target === '_blank' || (typeof app.address === 'string' && HTTP_REGEX.test(app.address));
};

type ModuleWithEntcoreScope = {
  entcoreScope?: string[];
};

export const isMobileApp = (app: AppsInfo, modules: AnyNavigableModule[]): boolean => {
  return modules.some(module => {
    const config = module.config as ModuleWithEntcoreScope;

    if (!config.entcoreScope || config.entcoreScope.length === 0) {
      return false;
    }

    return config.entcoreScope.some(scope => app?.prefix?.includes(scope) || app?.address?.includes(scope));
  });
};

export const isMobileAppV2 = (app: IEntcoreApp, modules: AnyNavigableModule[]): boolean => {
  return modules.some(module => module.config.matchEntcoreApp(app, []));
};
