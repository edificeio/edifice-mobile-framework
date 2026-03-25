import React from 'react';
import { Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { MY_APPS_FILTERS } from './filter-config';
import { styles } from './styles';
import { MyAppsFilterItemFilter, MyAppsFiltersProps } from './types';
import { useAnimatedSearchStyles } from './useAnimatedSearchStyles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import SearchBar from '~/framework/components/search-bar';
import { SearchBarHandle } from '~/framework/components/search-bar/types';
import { SmallActionText } from '~/framework/components/text';
import { MyAppsFilterCell } from '~/framework/modules/myapps/components';

export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  const searchQuery = selectedFilter.type === 'search' ? selectedFilter.value : '';

  const [searchActive, setSearchActive] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState<boolean>(false);

  const listRef = React.useRef<any>(null);
  const searchRef = React.useRef<SearchBarHandle>(null);

  const { animatedContainerStyle, animatedIconStyle, animatedSearchStyle, close, open } = useAnimatedSearchStyles();
  const borderColor = !searchActive
    ? theme.palette.primary.regular
    : searchFocused
      ? theme.palette.primary.regular
      : theme.palette.grey.cloudy;

  const scrollToItem = React.useCallback((index: number) => {
    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });
  }, []);

  const resetCategory = React.useCallback(() => {
    onFilterChange({ type: 'category', value: 'toutes' });
  }, [onFilterChange]);

  const scrollToStart = React.useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const clearSearch = React.useCallback(() => {
    onFilterChange({ type: 'search', value: '' });
  }, [onFilterChange]);

  const openSearch = React.useCallback(() => {
    scrollToStart();
    setSearchActive(true);
    resetCategory();
    open();
    setTimeout(() => searchRef.current?.focus(), 250);
  }, [open, resetCategory, scrollToStart]);

  const closeSearch = React.useCallback(() => {
    close();
    setSearchActive(false);
    clearSearch();
    resetCategory();
    scrollToStart();
  }, [clearSearch, close, resetCategory, scrollToStart]);

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={MY_APPS_FILTERS}
      keyExtractor={item => {
        if (item.type === 'separator') return 'filter-separator';
        return item.labelKey;
      }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.list}
      scrollEnabled={!searchActive}
      ListHeaderComponent={
        <View style={styles.searchContainerWrapper}>
          <Animated.View style={[styles.animatedSearchContainer, { borderColor }, animatedContainerStyle]}>
            <Animated.View style={[styles.searchIcon, animatedIconStyle]}>
              <Pressable style={styles.clickzone} onPress={openSearch}>
                <Svg name="ui-search" width={20} height={20} fill={theme.ui.text.regular} />
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.searchOverlay, animatedSearchStyle]}>
              <SearchBar
                ref={searchRef}
                clearButtonCustomColor={styles.clearButtonColor.color}
                query={searchQuery}
                placeholder={I18n.get('common-search')}
                onChangeQuery={value => onFilterChange({ type: 'search', value })}
                onClear={clearSearch}
                onFocusChange={setSearchFocused}
                containerStyle={[styles.search, !searchFocused && searchQuery.length === 0 ? styles.searchInactive : undefined]}
              />
            </Animated.View>
          </Animated.View>

          {searchActive && (
            <SmallActionText style={styles.cancelTextStyle} onPress={closeSearch}>
              {I18n.get('common-cancel')}
            </SmallActionText>
          )}
        </View>
      }
      renderItem={({ index, item }) => {
        if (item.type === 'separator') {
          return <View style={styles.separator} />;
        }

        const filterItem = item as MyAppsFilterItemFilter;
        const isSelected =
          selectedFilter.type === filterItem.filter.type && JSON.stringify(filterItem.filter) === JSON.stringify(selectedFilter);

        return (
          <MyAppsFilterCell
            label={I18n.get(filterItem.labelKey)}
            selected={isSelected}
            onPress={() => {
              scrollToItem(index);
              onFilterChange(filterItem.filter);
            }}
          />
        );
      }}
    />
  );
};

export default MyAppsFilters;
