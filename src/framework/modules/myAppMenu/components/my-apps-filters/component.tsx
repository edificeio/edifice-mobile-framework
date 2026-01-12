import React from 'react';
import { Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { MY_APPS_FILTERS } from './filter-config';
import { styles } from './styles';
import { MyAppsFiltersProps } from './types';
import { useAnimatedSearchStyles } from './useAnimatedSearchStyles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import SearchBar from '~/framework/components/search-bar';
import { SmallActionText } from '~/framework/components/text';
import { MyAppsFilterCell } from '~/framework/modules/myAppMenu/components/my-apps-filters-cell';

export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  const searchQuery = selectedFilter.type === 'search' ? selectedFilter.value : '';

  const [searchActive, setSearchActive] = React.useState(false);

  const { animatedContainerStyle, close, open } = useAnimatedSearchStyles();

  const resetCategory = React.useCallback(() => {
    onFilterChange({ type: 'category', value: 'toutes' });
  }, [onFilterChange]);

  const openSearch = React.useCallback(() => {
    setSearchActive(true);
    resetCategory();
    open();
  }, [open, resetCategory]);

  const closeSearch = React.useCallback(() => {
    close();
    setSearchActive(false);
  }, [close]);

  return (
    <FlatList
      horizontal
      data={MY_APPS_FILTERS}
      keyExtractor={item => item.labelKey}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.list}
      scrollEnabled={!searchActive}
      ListHeaderComponent={
        <View style={styles.searchContainerWrapper}>
          <Animated.View style={[styles.animatedSearchContainer, animatedContainerStyle]}>
            {searchActive ? (
              <SearchBar
                query={searchQuery}
                placeholder={I18n.get('common-search')}
                onChangeQuery={value => onFilterChange({ type: 'search', value })}
                onClear={closeSearch}
                containerStyle={styles.search}
              />
            ) : (
              <Pressable onPress={openSearch} style={styles.searchIcon}>
                <Svg name="ui-search" width={20} height={20} fill={theme.ui.text.regular} />
              </Pressable>
            )}
          </Animated.View>

          {searchActive && (
            <SmallActionText style={styles.cancelTextStyle} onPress={closeSearch}>
              {I18n.get('common-cancel')}
            </SmallActionText>
          )}
        </View>
      }
      renderItem={({ item }) => {
        const isSelected =
          selectedFilter.type === item.filter.type && JSON.stringify(item.filter) === JSON.stringify(selectedFilter);

        return (
          <MyAppsFilterCell label={I18n.get(item.labelKey)} selected={isSelected} onPress={() => onFilterChange(item.filter)} />
        );
      }}
    />
  );
};

export default MyAppsFilters;
