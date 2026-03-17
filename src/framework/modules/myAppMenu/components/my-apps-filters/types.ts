import { MyAppsFilter } from '~/framework/modules/myapps/types';

export type { MyAppsFilterItem, MyAppsFilterItemFilter, MyAppsFilterItemSeparator } from './filter-config';

export interface MyAppsFiltersProps {
  selectedFilter: MyAppsFilter;
  onFilterChange: (filter: MyAppsFilter) => void;
}
