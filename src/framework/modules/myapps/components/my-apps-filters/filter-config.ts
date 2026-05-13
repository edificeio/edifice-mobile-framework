import { MyAppsFilter, MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';

/**
 * To add new category we do it here after creating the I18n key
 * and update the @type {MyAppsFilterCategories} in ~/framework/modules/myapps/types
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
  testID?: string;
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
    filter: { type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.all } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.all,
    testID: 'myapps-filter-all',
    type: 'filter' as const,
  },
  communication: {
    filter: { type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.communication } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.communication,
    testID: 'myapps-filter-communication',
    type: 'filter' as const,
  },
  favorites: {
    filter: { type: MyAppsFilterTypes.Favorites } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.favorites,
    testID: 'myapps-filter-favorites',
    type: 'filter' as const,
  },
  libraries: {
    filter: { type: MyAppsFilterTypes.Libraries } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.libraries,
    testID: 'myapps-filter-libraries',
    type: 'filter' as const,
  },
  organisation: {
    filter: { type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.organisation } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.organisation,
    testID: 'myapps-filter-organisation',
    type: 'filter' as const,
  },
  otherServices: {
    filter: { type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.otherServices } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.otherServices,
    testID: 'myapps-filter-other-services',
    type: 'filter' as const,
  },
  pedagogie: {
    filter: { type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.pedagogie } as const,
    labelKey: MY_APPS_FILTER_LABEL_KEYS.pedagogie,
    testID: 'myapps-filter-pedagogie',
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
