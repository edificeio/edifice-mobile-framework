import React from 'react';
import { Keyboard, ListRenderItem, Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { MY_APPS_FILTERS, MyAppsFilterItem } from './filter-config';
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
import { MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';

export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  const searchQuery = selectedFilter.type === MyAppsFilterTypes.Search ? selectedFilter.value : '';

  const [searchActive, setSearchActive] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState<boolean>(false);

  const listRef = React.useRef<any>(null);
  const searchRef = React.useRef<SearchBarHandle>(null);

  const { animatedContainerStyle, animatedIconStyle, animatedSearchStyle, close, open } = useAnimatedSearchStyles();

  const borderColor = searchActive && !searchFocused ? theme.palette.grey.cloudy : theme.palette.primary.regular;

  const scrollToItem = React.useCallback((index: number) => {
    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });
  }, []);

  const resetCategory = React.useCallback(() => {
    onFilterChange({ type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.all });
  }, [onFilterChange]);

  const scrollToStart = React.useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const clearSearch = React.useCallback(() => {
    onFilterChange({ type: MyAppsFilterTypes.Search, value: '' });
  }, [onFilterChange]);

  const openSearch = React.useCallback(() => {
    scrollToStart();
    setSearchActive(true);
    onFilterChange({ type: MyAppsFilterTypes.Search, value: '' });
    open();
    setTimeout(() => searchRef.current?.focus(), 250);
  }, [onFilterChange, open, scrollToStart]);

  const closeSearch = React.useCallback(() => {
    searchRef.current?.blur();
    Keyboard.dismiss();
    close();
    setSearchActive(false);
    clearSearch();
    resetCategory();
    scrollToStart();
  }, [clearSearch, close, resetCategory, scrollToStart]);

  React.useEffect(() => {
    if (searchActive && selectedFilter.type !== MyAppsFilterTypes.Search) {
      close();
      setSearchActive(false);
      scrollToStart();
      searchRef.current?.clear();
    }
  }, [selectedFilter, searchActive, close, scrollToStart]);

  const onFilterTabPress = React.useCallback(
    (filter: MyAppsFilterItemFilter['filter'], index: number) => () => {
      scrollToItem(index);
      onFilterChange(filter);
    },
    [onFilterChange, scrollToItem],
  );

  const renderSearchComponent = React.useMemo(
    () => (
      <View style={[styles.searchContainerWrapper, searchActive && styles.searchContainerWrapperActive]}>
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
              onChangeQuery={value => onFilterChange({ type: MyAppsFilterTypes.Search, value })}
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
    ),
    [
      animatedContainerStyle,
      animatedIconStyle,
      animatedSearchStyle,
      borderColor,
      clearSearch,
      closeSearch,
      onFilterChange,
      searchActive,
      searchFocused,
      searchQuery,
      openSearch,
    ],
  );

  const renderItem: ListRenderItem<MyAppsFilterItem> = React.useCallback(
    ({ index, item }) => {
      if (item.type === 'separator') {
        return <View style={styles.separator} />;
      }

      const filterItem = item;
      const isSelected =
        selectedFilter.type === filterItem.filter.type && JSON.stringify(filterItem.filter) === JSON.stringify(selectedFilter);

      return (
        <MyAppsFilterCell
          label={I18n.get(filterItem.labelKey)}
          selected={isSelected}
          onPress={onFilterTabPress(filterItem.filter, index)}
          testID={filterItem.testID}
        />
      );
    },
    [onFilterTabPress, selectedFilter],
  );

  const keyExtractor = React.useCallback((item: MyAppsFilterItem, index: number) => {
    if (item.type === 'separator') return `separator-${index}`;
    return item.labelKey;
  }, []);

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={MY_APPS_FILTERS}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.list}
      scrollEnabled={!searchActive}
      keyboardShouldPersistTaps="handled" // fixes keyboard dismiss when tapping on tab menu item while search is active
      ListHeaderComponent={renderSearchComponent}
      renderItem={renderItem}
    />
  );
};

export default MyAppsFilters;
