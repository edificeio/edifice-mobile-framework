import React from 'react';
import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { MyAppsCard } from '../my-apps-card';
import { styles } from './styles';
import { MyAppsListProps } from './types';

import { EmptyScreen } from '~/framework/components/empty-screens';
import { PaginatedFlashList, PaginatedFlashListProps, PaginatedListItem } from '~/framework/components/list/paginated-list';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

const NUM_COLUMNS = 2;
const PAGE_SIZE = 20;

export const MyAppsList = ({ apps, onLongPressApp, onPressApp }: MyAppsListProps) => {
  const appsListRef = React.useRef<FlashList<PaginatedListItem<AppsInfoAggregated>>>(null);

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<AppsInfoAggregated>['keyExtractor']>>(
    item => item.name,
    [],
  );

  if (!apps.length) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyScreen svgImage="empty-search" title="Aucune application" />
      </View>
    );
  }

  return (
    <PaginatedFlashList
      ref={appsListRef}
      data={apps}
      pageSize={PAGE_SIZE}
      numColumns={NUM_COLUMNS}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.content}
      renderItem={({ index, item }) => (
        <MyAppsCard
          key={`${item.name}-#${index}`}
          app={item}
          onPress={() => onPressApp(item)}
          onLongPress={() => onLongPressApp?.(item)}
        />
      )}
      renderPlaceholderItem={() => <View style={[styles.item, styles.placeholder]} />}
    />
  );
};
export default MyAppsList;
