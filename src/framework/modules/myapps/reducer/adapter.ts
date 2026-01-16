import { AppsInfoAggregated, MyAppsCategories } from '~/framework/modules/myapps/types';
import { AnyModule, AnyNavigableModule, IEntcoreApp } from '~/framework/util/moduleTool';

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

export const isMobileApp = (app: IEntcoreApp, modules: AnyNavigableModule[]): boolean => {
  return modules.some(module => module.config.matchEntcoreApp(app));
};
