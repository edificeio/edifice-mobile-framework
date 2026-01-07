import { AppsInfoAggregated, MyAppsCategories } from '~/framework/modules/myapps/types';

export const resolveAppCategory = (app: AppsInfoAggregated): MyAppsCategories => {
  if (app.type === 'connector' || !app.isMobile) {
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
