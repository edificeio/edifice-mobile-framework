import React from 'react';

import { MY_APPS_FILTERS } from './filter-config';
import { styles } from './styles';
import { MyAppsFiltersProps } from './types';

import { I18n } from '~/app/i18n';
import FlatList from '~/framework/components/list/flat-list';
import { MyAppsFilterCell } from '~/framework/modules/myAppMenu/components/my-apps-filters-cell';

export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  return (
    <FlatList
      horizontal
      data={MY_APPS_FILTERS}
      keyExtractor={item => item.labelKey}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.list}
      renderItem={({ item }) => {
        const isSelected = JSON.stringify(item.filter) === JSON.stringify(selectedFilter);

        return (
          <MyAppsFilterCell label={I18n.get(item.labelKey)} selected={isSelected} onPress={() => onFilterChange(item.filter)} />
        );
      }}
    />
  );
};
export default MyAppsFilters;
