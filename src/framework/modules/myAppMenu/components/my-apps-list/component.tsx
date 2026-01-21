import React from 'react';
import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { styles } from './styles';
import { MyAppsListItem, MyAppsListProps } from './types';
import { buildAppItem, buildFavoritesList, isSeparator } from './utils';

import { I18n } from '~/app/i18n';
import { AppDispatch, getStore } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import {
  LOADING_ITEM_DATA,
  PaginatedFlashList,
  PaginatedFlashListProps,
  PaginatedListItem,
} from '~/framework/components/list/paginated-list';
import { SmallBoldText } from '~/framework/components/text';
import { MyAppsCard } from '~/framework/modules/myAppMenu/components/my-apps-card';
import { toggleFavorite } from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

const NUM_COLUMNS = 2;
const PAGE_SIZE = 20;

export const MyAppsList = ({ apps, emptyScreenConfig, isFavoritesFilter, onLongPressApp, onPressApp }: MyAppsListProps) => {
  const appsListRef = React.useRef<FlashList<PaginatedListItem<MyAppsListItem>>>(null);
  const store = getStore();
  const dispatch = store.dispatch as AppDispatch;

  const data: MyAppsListItem[] = React.useMemo(() => {
    if (!isFavoritesFilter) {
      return apps.map(buildAppItem);
    }

    return buildFavoritesList(apps);
  }, [apps, isFavoritesFilter]);

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<MyAppsListItem>['keyExtractor']>>((item, index) => {
    if (isSeparator(item)) return `separator-${index}`;
    return item.app.name;
  }, []);

  const getItemType = React.useCallback<NonNullable<PaginatedFlashListProps<MyAppsListItem>['getItemType']>>(item => item.type, []);

  const overrideItemLayout = React.useCallback<NonNullable<PaginatedFlashListProps<MyAppsListItem>['overrideItemLayout']>>(
    (layout, item) => {
      if (item === LOADING_ITEM_DATA) return;

      if (item.type === 'separator') {
        layout.span = NUM_COLUMNS;
        layout.size = 40;
      } else {
        layout.span = 1;
      }
    },
    [],
  );

  const handlePress = React.useCallback(
    (app: AppsInfoAggregated) => {
      if (isFavoritesFilter) {
        onPressApp(app);
      } else {
        dispatch(toggleFavorite(app.name));
      }
    },
    [isFavoritesFilter, onPressApp, dispatch],
  );

  const renderItem = React.useCallback<PaginatedFlashListProps<MyAppsListItem>['renderItem']>(
    ({ item }) => {
      if (isSeparator(item)) {
        return (
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <SmallBoldText style={styles.separatorText}>{I18n.get('myapp-home-filter-favorites-other-services')}</SmallBoldText>
          </View>
        );
      }

      return (
        <MyAppsCard
          isFavoritesFilter={isFavoritesFilter}
          app={item.app}
          onPress={() => handlePress(item.app)}
          onLongPress={() => onLongPressApp?.(item.app)}
        />
      );
    },
    [isFavoritesFilter, handlePress, onLongPressApp],
  );

  if (!data.length) {
    const { text, title } = emptyScreenConfig;
    return (
      <View style={styles.emptyContainer}>
        <EmptyScreen svgImage="empty-search" title={I18n.get(title)} text={I18n.get(text)} />
      </View>
    );
  }

  return (
    <PaginatedFlashList
      ref={appsListRef}
      data={data}
      pageSize={PAGE_SIZE}
      numColumns={NUM_COLUMNS}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      getItemType={getItemType}
      overrideItemLayout={overrideItemLayout}
      renderItem={renderItem}
      renderPlaceholderItem={() => <View style={[styles.item, styles.placeholder]} />}
    />
  );
};
export default MyAppsList;
