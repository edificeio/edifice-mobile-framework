import type { MyAppsFilter } from '~/modules/myapps/model';

/**
 * The filters of « Mes applis », in their order. Their `testID` are those of the old module (E2E tests): `pedagogie`,
 * `other-services`.
 * The filter `libraries` exists but is hidden, as in the old module.
 */
export interface MyAppsFilterItem {
  filter: MyAppsFilter;
  labelKey: string;
  testID: string;
}

const FILTERS = {
  all: { filter: { type: 'all' }, labelKey: 'myapp-home-filter-all', testID: 'myapps-filter-all' },
  communication: {
    filter: { type: 'category', value: 'communication' },
    labelKey: 'myapp-home-filter-communication',
    testID: 'myapps-filter-communication',
  },
  favorites: { filter: { type: 'favorites' }, labelKey: 'myapp-home-filter-favorites', testID: 'myapps-filter-favorites' },
  libraries: { filter: { type: 'libraries' }, labelKey: 'myapp-home-filter-libraries', testID: 'myapps-filter-libraries' },
  organisation: {
    filter: { type: 'category', value: 'organisation' },
    labelKey: 'myapp-home-filter-organisation',
    testID: 'myapps-filter-organisation',
  },
  otherServices: {
    filter: { type: 'other-services' },
    labelKey: 'myapp-home-filter-other-services',
    testID: 'myapps-filter-other-services',
  },
  pedagogy: {
    filter: { type: 'category', value: 'pedagogy' },
    labelKey: 'myapp-home-filter-pedagogie',
    testID: 'myapps-filter-pedagogie',
  },
} satisfies Record<string, MyAppsFilterItem>;

export const MY_APPS_FILTERS: readonly MyAppsFilterItem[] = [
  FILTERS.all,
  FILTERS.favorites,
  FILTERS.communication,
  FILTERS.pedagogy,
  FILTERS.organisation,
  // FILTERS.libraries,
  FILTERS.otherServices,
];

/** The same filter (a search matches any search). */
export const isSameFilter = (a: MyAppsFilter, b: MyAppsFilter): boolean =>
  a.type === b.type && ('value' in a ? a.value : undefined) === ('value' in b ? b.value : undefined);
