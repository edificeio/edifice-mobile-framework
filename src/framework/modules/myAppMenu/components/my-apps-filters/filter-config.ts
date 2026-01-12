import { MyAppsFilter } from '~/framework/modules/myapps/types';

export const MY_APPS_FILTER_LABEL_KEYS = {
  all: 'myapp-home-filter-all',
  communication: 'myapp-home-filter-communication',
  favorites: 'myapp-home-filter-favorites',
  libraries: 'myapp-home-filter-libraries',
  organisation: 'myapp-home-filter-organisation',
  pedagogie: 'myapp-home-filter-pedagogie',
  servicesExternes: 'myapp-home-filter-servicesExternes',
} as const;

export type MyAppsFilterLabelKeyMap = typeof MY_APPS_FILTER_LABEL_KEYS;

export type MyAppsFilterLabelKey = MyAppsFilterLabelKeyMap[keyof MyAppsFilterLabelKeyMap];

export interface MyAppsFilterItem {
  filter: MyAppsFilter;
  labelKey: MyAppsFilterLabelKey;
}

export const MY_APPS_FILTER_CONFIG = {
  all: {
    filter: { type: 'category', value: 'toutes' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.all,
  },
  communication: {
    filter: { type: 'category', value: 'communication' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.communication,
  },
  favorites: {
    filter: { type: 'favorites' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.favorites,
  },
  libraries: {
    filter: { type: 'libraries' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.libraries,
  },
  organisation: {
    filter: { type: 'category', value: 'organisation' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.organisation,
  },
  pedagogie: {
    filter: { type: 'category', value: 'pedagogie' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.pedagogie,
  },
  servicesExternes: {
    filter: { type: 'category', value: 'servicesExternes' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.servicesExternes,
  },
} as const;

export const MY_APPS_FILTERS: readonly MyAppsFilterItem[] = [
  MY_APPS_FILTER_CONFIG.all,
  MY_APPS_FILTER_CONFIG.favorites,
  MY_APPS_FILTER_CONFIG.communication,
  MY_APPS_FILTER_CONFIG.pedagogie,
  MY_APPS_FILTER_CONFIG.organisation,
  // MY_APPS_FILTER_CONFIG.libraries,
  MY_APPS_FILTER_CONFIG.servicesExternes,
];

export const resolveFilterLabelKey = (filter: MyAppsFilter): MyAppsFilterLabelKey => {
  if (filter.type === 'favorites') {
    return MY_APPS_FILTER_CONFIG.favorites.labelKey;
  }

  return (
    MY_APPS_FILTERS.find(item => item.filter.type === 'category' && item.filter.value === filter.value)?.labelKey ??
    MY_APPS_FILTER_CONFIG.servicesExternes.labelKey
  );
};
