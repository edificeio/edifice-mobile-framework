import { MyAppsFilter } from '~/framework/modules/myapps/types';

export interface MyAppsFiltersProps {
  selectedFilter: MyAppsFilter;
  onFilterChange: (filter: MyAppsFilter) => void;
}
