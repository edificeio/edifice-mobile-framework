import * as React from 'react';

import { FlashList, FlashListProps } from '@shopify/flash-list';

import { estimatedItemSize, ResourceExplorerItem } from './item-component';
import styles from './styles';
import type { ResourceGrid } from './types';

import type { ExplorerData } from '~/framework/modules/explorer/model/types';

const defaultKeyExtractor: ResourceGrid.Props<ResourceGrid.BaseItemT>['keyExtractor'] = (item, index) => {
  return item === null ? index.toString() : `${item.resourceType}${item.id}`;
};

const getItemType: FlashListProps<ResourceGrid.BaseItemT>['getItemType'] = item => item?.resourceType ?? 0;

export function ResourceGrid<T extends ExplorerData['items'][0]>({
  keyExtractor,
  moduleConfig: { displayColor, displayPicture },
  ...flashListProps
}: ResourceGrid.Props<T>) {
  return (
    <FlashList
      keyExtractor={keyExtractor ?? defaultKeyExtractor}
      {...flashListProps}
      // data={data.items}
      numColumns={2}
      getItemType={getItemType}
      contentContainerStyle={styles.contentContainer}
      renderItem={ResourceExplorerItem}
      // extraData={extraData}
      estimatedItemSize={estimatedItemSize}
      // estimatedListSize={estimatedListSize}
      // refreshControl={refreshControl}
      // viewabilityConfig={viewabilityConfig}
      // onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}
