import React from 'react';
import { Keyboard, ListRenderItem, Pressable, FlatList as RNFlatList, View } from 'react-native';

import Animated from 'react-native-reanimated';

import theme from '~/app/theme';
import FlatList from '~/framework/components/list/flat-list';
import { Svg } from '~/framework/components/picture';
import SearchBar from '~/framework/components/search-bar';
import { SearchBarHandle } from '~/framework/components/search-bar/types';
import { SmallActionText } from '~/framework/components/text';
import { MyAppsFilterCell } from '~/modules/myapps/components/my-apps-filter-cell/component';
import { I18n } from '~/util/i18n';

import { isSameFilter, MY_APPS_FILTERS, MyAppsFilterItem } from './filter-config';
import { useAnimatedSearchStyles } from './hooks';
import { styles } from './styles';
import { MyAppsFiltersProps } from './types';

const SEARCH_ICON_SIZE = 20;

/** The filters of « Mes applis » in a horizontal list, after a search that expands from its icon. */
export const MyAppsFilters = ({ onFilterChange, selectedFilter }: MyAppsFiltersProps) => {
  const searchQuery = selectedFilter.type === 'search' ? selectedFilter.value : '';

  const [searchActive, setSearchActive] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState<boolean>(false);

  const listRef = React.useRef<RNFlatList<MyAppsFilterItem>>(null);
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

  const scrollToStart = React.useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const clearSearch = React.useCallback(() => {
    onFilterChange({ type: 'search', value: '' });
  }, [onFilterChange]);

  const openSearch = React.useCallback(() => {
    scrollToStart();
    setSearchActive(true);
    onFilterChange({ type: 'search', value: '' });
    open();
    // No delay before the focus (§4 n° 7 of the migration sheet): to put back only if the animation is broken
    searchRef.current?.focus();
  }, [onFilterChange, open, scrollToStart]);

  const closeSearch = React.useCallback(() => {
    searchRef.current?.blur();
    Keyboard.dismiss();
    close();
    setSearchActive(false);
    onFilterChange({ type: 'all' });
    scrollToStart();
  }, [close, onFilterChange, scrollToStart]);

  React.useEffect(() => {
    // Another filter was chosen (a tab, the screen left…) while searching: the search closes, with the keyboard
    if (searchActive && selectedFilter.type !== 'search') {
      searchRef.current?.blur();
      Keyboard.dismiss();
      close();
      setSearchActive(false);
      scrollToStart();
      searchRef.current?.clear();
    }
  }, [selectedFilter, searchActive, close, scrollToStart]);

  const onFilterTabPress = React.useCallback(
    (filter: MyAppsFilterItem['filter'], index: number) => () => {
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
            <Pressable
              accessibilityLabel={I18n.get('common-search')}
              accessibilityRole="search"
              style={styles.clickzone}
              onPress={openSearch}>
              <Svg name="ui-search" width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} fill={theme.ui.text.regular} />
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
    ({ index, item }) => (
      <MyAppsFilterCell
        label={I18n.get(item.labelKey)}
        selected={isSameFilter(item.filter, selectedFilter)}
        onPress={onFilterTabPress(item.filter, index)}
        testID={item.testID}
      />
    ),
    [onFilterTabPress, selectedFilter],
  );

  const keyExtractor = React.useCallback((item: MyAppsFilterItem) => item.testID, []);

  return (
    <FlatList
      ref={listRef}
      horizontal
      enableScrollToTop={false}
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
