import React from 'react';
import { Pressable, View } from 'react-native';

import { MY_APPS_FILTERS } from './filter-config';
import { styles } from './styles';
import { MyAppsFiltersProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import SearchBar from '~/framework/components/search-bar';
import { SmallActionText } from '~/framework/components/text';
import { MyAppsFilterCell } from '~/framework/modules/myAppMenu/components/my-apps-filters-cell';

export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  const searchQuery = selectedFilter.type === 'search' ? selectedFilter.value : '';
  const [searchActive, setSearchActive] = React.useState<boolean>(false);

  const handleFilterChange = React.useCallback(() => onFilterChange({ type: 'category', value: 'toutes' }), [onFilterChange]);

  const renderSearchBar = React.useCallback(() => {
    return (
      <View style={styles.searchContainerWrapper}>
        <SearchBar
          query={searchQuery}
          placeholder={I18n.get('common-search')}
          onChangeQuery={value => onFilterChange({ type: 'search', value })}
          onClear={handleFilterChange}
          containerStyle={styles.search}
        />
        <SmallActionText style={styles.cancelTextStyle} onPress={() => setSearchActive(false)}>
          {I18n.get('common-cancel')}
        </SmallActionText>
      </View>
    );
  }, [handleFilterChange, searchQuery, onFilterChange]);

  const renderList = React.useCallback(
    () => (
      <FlatList
        horizontal
        data={MY_APPS_FILTERS}
        keyExtractor={item => item.labelKey}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.list}
        ListHeaderComponent={
          <Pressable
            onPress={() => {
              setSearchActive(true);
              handleFilterChange();
            }}
            style={styles.searchFilterCell}>
            <Svg name="ui-search" width={20} height={20} fill={theme.ui.text.regular} />
          </Pressable>
        }
        renderItem={({ item }) => {
          const isSelected =
            selectedFilter.type === item.filter.type && JSON.stringify(item.filter) === JSON.stringify(selectedFilter);

          return (
            <MyAppsFilterCell label={I18n.get(item.labelKey)} selected={isSelected} onPress={() => onFilterChange(item.filter)} />
          );
        }}
      />
    ),
    [handleFilterChange, selectedFilter, onFilterChange],
  );

  return searchActive ? renderSearchBar() : renderList();
};

export default MyAppsFilters;
