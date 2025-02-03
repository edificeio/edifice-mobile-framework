import * as React from 'react';
import { View, ViewProps } from 'react-native';

import { FlashList, FlashListProps, ListRenderItem, ViewToken } from '@shopify/flash-list';

import { ExplorerData, Folder, Resource } from '../../model/types';
import service from '../../service/index';
import styles from './styles';
import type { ResourceExplorerTemplate } from './types';

import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { BodyText, TextSizeStyle } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { HTTPError } from '~/framework/util/http';

const contentContainerStyle: FlashListProps<ExplorerData['items'][0]>['contentContainerStyle'] = {
  padding: UI_SIZES.spacing.big / 2,
};

const elementContainerStyle: ViewProps['style'] = {
  margin: UI_SIZES.spacing.big / 2,
  overflow: 'hidden',
};

const ResourceExplorerItem: ListRenderItem<ExplorerData['items'][0]> = ({ index, item }) => {
  return (
    <View style={elementContainerStyle}>
      <BodyText style={styles.item}>{item === null ? `(${index})` : item.name}</BodyText>
    </View>
  );
};

const estimatedListSize = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};

const keyExtractor: FlashListProps<ExplorerData['items'][0]>['keyExtractor'] = (item, index) => {
  // console.debug('keyExtractor', index, item);
  return item === null ? index.toString() : `${item.resourceType}${item.id}`;
};

const getItemType: FlashListProps<ExplorerData['items'][0]>['getItemType'] = item => item?.resourceType ?? 0;

const viewabilityConfig: FlashListProps<ExplorerData['items'][0]>['viewabilityConfig'] = {
  itemVisiblePercentThreshold: 0,
  minimumViewTime: 250,
  waitForInteraction: false,
};

const PAGE_SIZE = 24;

export function ResourceExplorerTemplate({ moduleConfig: { displayPicture } }: ResourceExplorerTemplate.AllProps) {
  const [data, setData] = React.useState<ExplorerData>({ items: [], nbFolders: 0, nbResources: 0 });
  // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
  const dataRef = React.useRef(data);
  dataRef.current = data;

  const fetchingPages = React.useRef<Set<number>>(new Set());

  const loadPage = React.useCallback(async (start_idx: number, reloadAll: boolean = false) => {
    // console.debug('LOAD FROM', start_idx, PAGE_SIZE);
    // Delay to load

    // await new Promise<void>(function (resolve) {
    //   setTimeout(function () {
    //     resolve();
    //   }, 1000);
    // });
    // Call Page API
    try {
      const response = await service.resources.get({
        application: 'wiki',
        folder: 'default',
        order_by: 'updatedAt:desc',
        page_size: PAGE_SIZE,
        resource_type: 'wiki',
        start_idx: start_idx,
      });

      // Merge Page Data into existent
      setData(previousData => {
        // console.debug(previousData, data);
        const newItems: (Folder | Resource | null)[] = [...response.folders, ...new Array(response.pagination.total).fill(null)];
        const keepOldResources = !reloadAll && previousData.nbResources === response.pagination.total;
        // Fill resources with old or new data
        // console.debug('BEFORE', response.pagination.pageStart, newItems);
        // console.debug(
        //   'RESPONSE',
        //   response.pagination.pageStart,
        //   response.resources.map(e => e.name),
        // );
        for (let iResource = 0; iResource < response.pagination.total; ++iResource) {
          if (
            iResource >= response.pagination.pageStart &&
            iResource < response.pagination.pageStart + response.pagination.pageSize
          ) {
            // console.debug(
            //   `INSERT (${response.folders.length} + ${response.pagination.pageStart} +) ${iResource - response.pagination.pageStart} at ${response.folders.length + iResource} (${response.resources[iResource - response.pagination.pageStart].name})`,
            // );
            newItems[response.folders.length + iResource] = response.resources[iResource - response.pagination.pageStart];
          } else if (keepOldResources) {
            // console.debug('copy OLD resource from', previousData.nbFolders + iResource, 'to', response.folders.length + iResource);
            newItems[response.folders.length + iResource] = previousData.items[previousData.nbFolders + iResource];
          }
        }
        // console.debug('AFTER', newItems);
        return {
          items: newItems,
          nbFolders: response.folders.length,
          nbResources: response.pagination.total,
        };
      });
    } catch (e) {
      if (e instanceof HTTPError) console.error(await e.read(e.text));
      else console.error(e?.toString());
      throw e;
    }
  }, []);

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      // console.debug('viewableItems', viewableItems);
      // console.debug('data', dataRef.current.items);
      const firstVisibleIndex = viewableItems.at(0)?.index;
      const lastVisibleIndex = viewableItems.at(-1)?.index;
      // console.debug('firstVisibleIndex', firstVisibleIndex);
      if (
        firstVisibleIndex === undefined ||
        firstVisibleIndex === null ||
        lastVisibleIndex === undefined ||
        lastVisibleIndex === null
      ) {
        return;
      }

      let windowStart = firstVisibleIndex - dataRef.current.nbFolders;
      let windowEnd = lastVisibleIndex - dataRef.current.nbFolders + PAGE_SIZE / 2;
      // console.debug('firstResourceIndex', windowStart);
      windowStart = Math.max(0, windowStart - (windowStart % PAGE_SIZE));
      windowEnd = Math.max(0, windowEnd - (windowEnd % PAGE_SIZE));
      // console.info('windowStart', windowStart);

      let pageToLoad: number | undefined;
      const iStart = Math.max(0, windowStart);
      const iEnd = windowEnd + PAGE_SIZE;
      // console.debug('iStart, iEnd', iStart, iEnd);
      // console.debug(data.items);
      for (let i = iStart; i < iEnd; ++i) {
        // console.debug(
        //   `?? ${i} | ${data.items[i + data.nbFolders] === null ? 'null' : (data.items[i + data.nbFolders]?.name ?? 'undefined')}`,
        // );
        if (dataRef.current.items[i + dataRef.current.nbFolders] === null) {
          // console.debug(`Found null at ${i}. Load page ${i - (i % PAGE_SIZE)}`);
          pageToLoad = i - (i % PAGE_SIZE);
        }
      }
      // console.debug('pageToLoad', pageToLoad);

      if (pageToLoad && !fetchingPages.current.has(pageToLoad)) {
        fetchingPages.current.add(pageToLoad);
        loadPage(windowStart).then(() => {
          fetchingPages.current.delete(pageToLoad);
        });
      }
    },
    [loadPage],
  );

  const loadContent: ContentLoaderProps['loadContent'] = () => loadPage(0, true);

  const extraData = React.useMemo(
    () => ({
      nbFolders: data.nbFolders,
      nbResources: data.nbResources,
    }),
    [data.nbResources, data.nbFolders],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <FlashList
          data={data.items}
          numColumns={2}
          renderItem={ResourceExplorerItem}
          extraData={extraData}
          estimatedItemSize={TextSizeStyle.Medium.lineHeight * 5 + 4}
          estimatedListSize={estimatedListSize}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          refreshControl={refreshControl}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          contentContainerStyle={contentContainerStyle}
        />
      );
    },
    [data.items, extraData, onViewableItemsChanged],
  );

  return (
    <PageView>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} />
    </PageView>
  );
}

export default ResourceExplorerTemplate;
