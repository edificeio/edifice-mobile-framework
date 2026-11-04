import type { MyAppsFilter } from '~/modules/myapps/model';

export interface MyAppsFiltersProps {
  selectedFilter: MyAppsFilter;
  onFilterChange: (filter: MyAppsFilter) => void;
}
