import { MyAppsFilter } from '~/framework/modules/myapps/types';

/**
 * To add new category we do it here after creating the I18n key
 * and update the @type {MyAppsCategories} in ~/framework/modules/myapps/types
 * and thats it.
 */

export const MY_APPS_FILTER_LABEL_KEYS = {
  all: 'myapp-home-filter-all',
  communication: 'myapp-home-filter-communication',
  favorites: 'myapp-home-filter-favorites',
  libraries: 'myapp-home-filter-libraries',
  organisation: 'myapp-home-filter-organisation',
  otherServices: 'myapp-home-filter-other-services',
  pedagogie: 'myapp-home-filter-pedagogie',
} as const;

export type MyAppsFilterLabelKeyMap = typeof MY_APPS_FILTER_LABEL_KEYS;

export type MyAppsFilterLabelKey = MyAppsFilterLabelKeyMap[keyof MyAppsFilterLabelKeyMap];

export interface MyAppsFilterItemBase {
  labelKey: MyAppsFilterLabelKey;
}

export interface MyAppsFilterItemFilter extends MyAppsFilterItemBase {
  type: 'filter';
  filter: MyAppsFilter;
}

export interface MyAppsFilterItemSeparator {
  type: 'separator';
}

export type MyAppsFilterItem = MyAppsFilterItemFilter | MyAppsFilterItemSeparator;

export const MY_APPS_FILTER_CONFIG = {
  all: {
    filter: { type: 'category', value: 'toutes' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.all,
    type: 'filter' as const,
  },
  communication: {
    filter: { type: 'category', value: 'communication' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.communication,
    type: 'filter' as const,
  },
  favorites: {
    filter: { type: 'favorites' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.favorites,
    type: 'filter' as const,
  },
  libraries: {
    filter: { type: 'libraries' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.libraries,
    type: 'filter' as const,
  },
  organisation: {
    filter: { type: 'category', value: 'organisation' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.organisation,
    type: 'filter' as const,
  },
  otherServices: {
    filter: { type: 'category', value: 'otherServices' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.otherServices,
    type: 'filter' as const,
  },
  pedagogie: {
    filter: { type: 'category', value: 'pedagogie' } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.pedagogie,
    type: 'filter' as const,
  },
} as const;

export const MY_APPS_FILTERS: Readonly<MyAppsFilterItem[]> = [
  MY_APPS_FILTER_CONFIG.all,

  MY_APPS_FILTER_CONFIG.favorites,
  // { type: 'separator' } as MyAppsFilterItemSeparator,
  MY_APPS_FILTER_CONFIG.communication,
  MY_APPS_FILTER_CONFIG.pedagogie,
  MY_APPS_FILTER_CONFIG.organisation,
  // MY_APPS_FILTER_CONFIG.libraries,
  MY_APPS_FILTER_CONFIG.otherServices,
];
