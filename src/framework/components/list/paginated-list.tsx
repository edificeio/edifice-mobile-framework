/**
 * PaginatedList
 * List with pagination handling, with FlashList as list component.
 */

import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo as RNListRenderItemInfo, ViewToken, VirtualizedListProps } from 'react-native';

import { FlashList, FlashListProps, ListRenderItemInfo as SHListRenderItemInfo } from '@shopify/flash-list';

import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';

export const LOADING_ITEM_DATA = Symbol('LOADING_ITEM_DATA');

const DEFAULT_WINDOW_SIZE = 3;

const DEFAULT_FLATLIST_PLACEHOLDER_COUNT = 5;

const DEFAULT_VIEWABILIBY_CONFIG = {
  itemVisiblePercentThreshold: 0,
  minimumViewTime: 250,
  waitForInteraction: false,
};

export type PaginatedListItem<TItem> = TItem | typeof LOADING_ITEM_DATA;

interface CommonPaginatedListProps<TItem> {
  data?: PaginatedListItem<TItem>[] | null;
  keyExtractor?: (item: TItem, index: number) => string;

  /**
   * Called when a page needs to be loaded beacause one or more loading items are close to the viewport.
   * @param from first index to load
   * @param nb number of items to load
   * @param reloadAll existing data must be flushed
   * @returns a promise. Updated data needs to be passed with the `data` prop.
   */
  onPageReached?: (page: number, reloadAll?: boolean) => Promise<void>;

  /**
   * Called when a page needs to be loaded beacause one or more loading items are close to the viewport.
   * @param from first index to load
   * @param nb number of items to load
   * @param reloadAll existing data must be flushed
   * @returns a promise. Updated data needs to be passed with the `data` prop.
   */
  onItemsReached?: (from: number, nb: number, reloadAll?: boolean) => Promise<void>;

  /**
   * Called when a page couldn't be loaded (when `onPageReached` has thrown an exception)
   * @param error the error that is catch
   * @param from first index to load
   * @param nb number of items to load
   * @returns
   */
  onItemsError?: (error: any, from: number, nb: number) => void;

  /**
   * Called when a page couldn't be loaded (when `onPageReached` has thrown an exception)
   * @param error the error that is catch
   * @param from first index to load
   * @param nb number of items to load
   * @returns
   */
  onPageError?: (error: any, page: number) => void;

  /**
   * Size of a page. `onPageReached` will be called with value of `from` a multiple of `pageSize`.
   */
  pageSize: number;

  /**
   * Exprimed as a mutiplier of `pageSize` value. A value of 1 corresponds to pageSize value.
   * A distance around the viewport to consider a page needs to be loaded.
   * Default to 3, that means one page before AND one page after that ones are visible in the viewport.
   */
  windowSize?: number;

  /**
   * Override the index of visible items to calculate wich page to load.
   * This is useful when there is a bunch of non-paginated items at the beginning of the data.
   * @param index the found index of an element
   * @returns the index to take into account
   */
  getVisibleItemIndex?: (index: number) => number;
}

export interface PaginatedFlashListProps<TItem>
  extends CommonPaginatedListProps<TItem>,
    Omit<
      FlashListProps<PaginatedListItem<TItem>>,
      'onRefresh' | 'refreshing' | 'refreshControl' | 'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem'
    > {
  getItemType?: FlashListProps<TItem>['getItemType'];
  overrideItemLayout?: FlashListProps<PaginatedListItem<TItem>>['overrideItemLayout'];

  /**
   * render function for loaded items like every List component works
   */
  renderItem: NonNullable<FlashListProps<TItem>['renderItem']>;

  /**
   * render function for non-loaded items
   */
  renderPlaceholderItem: NonNullable<FlashListProps<typeof LOADING_ITEM_DATA>['renderItem']>;
}

export interface PaginatedFlatListProps<TItem>
  extends CommonPaginatedListProps<TItem>,
    Omit<
      FlatListProps<PaginatedListItem<TItem>>,
      'onRefresh' | 'refreshing' | 'refreshControl' | 'data' | 'keyExtractor' | 'overrideItemLayout' | 'renderItem'
    > {
  /**
   * render function for loaded items like every List component works
   */
  renderItem: NonNullable<FlatListProps<TItem>['renderItem']>;

  /**
   * render function for non-loaded items
   */
  renderPlaceholderItem: NonNullable<FlatListProps<typeof LOADING_ITEM_DATA>['renderItem']>;

  /**
   * How many items to render when initial data loading
   */
  placeholderNumberOfItems?: number;
}

/**
 * Estimates the number of initially displayed items to fill the screen with placeholder elements.
 * Give to it props that is used for paginated list component : pageSize, estimatedItemSize, estimatedListSize, horizontal and numColomns
 * @param pageSize
 * @param estimatedItemSize
 * @param estimatedListSize
 * @param horizontal
 * @param numColumns
 * @returns
 */
const computeEstimatedVisibleElements = (
  pageSize: PaginatedFlashListProps<unknown>['pageSize'],
  estimatedItemSize: PaginatedFlashListProps<unknown>['estimatedItemSize'],
  estimatedListSize: PaginatedFlashListProps<unknown>['estimatedListSize'],
  horizontal: PaginatedFlashListProps<unknown>['horizontal'],
  numColumns: PaginatedFlashListProps<unknown>['numColumns'],
) => {
  if (estimatedListSize === undefined || estimatedItemSize === undefined) return pageSize;
  if (horizontal) return Math.ceil(estimatedListSize.width / estimatedItemSize);
  return Math.ceil(estimatedListSize.height / estimatedItemSize) * (numColumns ?? 1);
};

/**
 * Function that returns new data array by combining old data with new received items
 * Use it with `useState` or withing a reducer function.
 * @param currentData all previous items
 * @param start form wich index to insert the data (a.k.a index of the start of the page)
 * @param newData new items with pagination info
 * @param total total of items that can be loaded in this array. If total changes, all the data is considered stale and will be reset
 * @param reloadAll force all the currentData to be considered stale
 * @returns
 */
export const staleOrSplice = <TItem,>(
  currentData: (TItem | typeof LOADING_ITEM_DATA)[],
  start: number,
  newData: TItem[],
  total: number,
  reloadAll?: boolean,
): PaginatedListItem<TItem>[] => {
  // This complicated algorithm merges old data with new data :
  // - Totals are always replaced
  // - Items are replaced if reloadAll === true OR total number of items has changed
  // - Items are merged else
  const keepOldData = !reloadAll && currentData.length === total;
  const updatedData: PaginatedListItem<TItem>[] = keepOldData ? [...currentData] : new Array(total).fill(LOADING_ITEM_DATA);
  return updatedData.splice(start, newData.length, ...newData);
};

// # Common pagination logic

const usePagination = <TItem,>({
  data,
  getVisibleItemIndex,
  keyExtractor: _keyExtractor,
  onItemsError,
  onItemsReached,
  onPageError,
  onPageReached,
  pageSize,
  windowSize = DEFAULT_WINDOW_SIZE,
}: CommonPaginatedListProps<TItem>) => {
  // Pages currenlty fetching
  const loadingPagesRef = React.useRef<Set<number>>(new Set());

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      try {
        await onPageReached?.(page, reloadAll);
        await onItemsReached?.(page * pageSize, pageSize, reloadAll);
      } catch (e) {
        onPageError?.(e, page);
        onItemsError?.(e, page * pageSize, pageSize);
        throw e;
      }
    },
    [onPageReached, onItemsReached, pageSize, onPageError, onItemsError],
  );

  /**
   * Algorithm here computes which pages are visible for current scroll position & call `loadData` for surrounding pages.
   */
  const onViewableItemsChanged = React.useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<PaginatedListItem<TItem>>[];
      changed: ViewToken<PaginatedListItem<TItem>>[];
    }) => {
      // 1. Get visible item indices
      let firstVisibleIndex = viewableItems.at(0)?.index;
      let lastVisibleIndex = viewableItems.at(-1)?.index;
      if (
        firstVisibleIndex === undefined ||
        firstVisibleIndex === null ||
        lastVisibleIndex === undefined ||
        lastVisibleIndex === null
      ) {
        return;
      }
      if (getVisibleItemIndex && firstVisibleIndex !== undefined && firstVisibleIndex !== null)
        firstVisibleIndex = getVisibleItemIndex(firstVisibleIndex);
      if (getVisibleItemIndex && lastVisibleIndex !== undefined && lastVisibleIndex !== null)
        lastVisibleIndex = getVisibleItemIndex(lastVisibleIndex);

      // 2. Includes windowSize to the computation
      const windowFirstIndex = firstVisibleIndex - Math.ceil((pageSize * (windowSize - 1)) / 2);
      const windowLastIndex = lastVisibleIndex + Math.ceil((pageSize * (windowSize - 1)) / 2);

      // 3. Compute the corresponding page numbers
      const windowFirstPage = Math.max(0, windowFirstIndex - (windowFirstIndex % pageSize)) / pageSize;
      const windowLastPage = Math.max(0, windowLastIndex - (windowLastIndex % pageSize)) / pageSize;
      const windowVisiblePages = Array.from({ length: windowLastPage - windowFirstPage + 1 }, (x, i) => i + windowFirstPage);

      // 4. Verify the need to load each visible page, and call `loadData` if applicable
      for (const page of windowVisiblePages) {
        let mustLoadPage: boolean = false;
        for (let i = page * pageSize; i < page * pageSize + pageSize; ++i) {
          if (data?.[i] === LOADING_ITEM_DATA) {
            mustLoadPage = true;
            break;
          }
        }
        if (mustLoadPage && !loadingPagesRef.current.has(page)) {
          loadingPagesRef.current.add(page);
          loadData(page).finally(() => {
            loadingPagesRef.current.delete(page);
          });
        }
      }
    },
    [data, getVisibleItemIndex, loadData, pageSize, windowSize],
  );

  const keyExtractor = React.useMemo<VirtualizedListProps<PaginatedListItem<TItem>>['keyExtractor']>(
    () =>
      _keyExtractor
        ? (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : _keyExtractor(item, index))
        : undefined,
    [_keyExtractor],
  );

  return { keyExtractor, loadData, onViewableItemsChanged };
};

// # Paginated FlashList Component

export const PaginatedFlashList = React.forwardRef(function <TItem>(
  {
    data,
    getItemType: _getItemType,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    onItemsError,
    onItemsReached,
    onPageError,
    onPageReached,
    pageSize,
    renderItem: _renderItem,
    renderPlaceholderItem,
    viewabilityConfig,
    windowSize,
    ...flashListProps
  }: Readonly<PaginatedFlashListProps<TItem>>,
  ref: React.ForwardedRef<FlashList<PaginatedListItem<TItem>>>,
) {
  // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
  // This is a bug of FlashList component.
  const dataRef = React.useRef(data);
  dataRef.current = data;

  const { keyExtractor, loadData, onViewableItemsChanged } = usePagination({
    data: dataRef.current,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    onItemsError,
    onItemsReached,
    onPageError,
    onPageReached,
    pageSize,
    windowSize,
  });

  const getItemType = React.useMemo<FlashListProps<PaginatedListItem<TItem>>['getItemType']>(
    () => (_getItemType ? (item, index) => (item === LOADING_ITEM_DATA ? 'loading' : _getItemType(item, index)) : undefined),
    [_getItemType],
  );

  const renderItem = React.useCallback<NonNullable<FlashListProps<PaginatedListItem<TItem>>['renderItem']>>(
    info => {
      return info.item === LOADING_ITEM_DATA
        ? renderPlaceholderItem(info as SHListRenderItemInfo<typeof LOADING_ITEM_DATA>)
        : _renderItem(info as SHListRenderItemInfo<TItem>);
    },
    [_renderItem, renderPlaceholderItem],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <FlashList<PaginatedListItem<TItem>>
          ref={ref}
          getItemType={getItemType}
          key="data"
          data={data}
          viewabilityConfig={viewabilityConfig ?? DEFAULT_VIEWABILIBY_CONFIG}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshControl={refreshControl}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          {...flashListProps}
        />
      );
    },
    [data, flashListProps, getItemType, keyExtractor, onViewableItemsChanged, ref, renderItem, viewabilityConfig],
  );

  // useState is used instead of useRef with a readonly manner to be able to use a init function (refs cannot take function as initialiser)
  const [placeholderData] = React.useState(
    React.useCallback(() => {
      const nbElementsInViewport = computeEstimatedVisibleElements(
        pageSize,
        flashListProps.estimatedItemSize,
        flashListProps.estimatedListSize,
        flashListProps.horizontal,
        flashListProps.numColumns,
      );
      return new Array(nbElementsInViewport).fill(LOADING_ITEM_DATA) as (typeof LOADING_ITEM_DATA)[];
    }, [
      flashListProps.estimatedItemSize,
      flashListProps.estimatedListSize,
      flashListProps.horizontal,
      flashListProps.numColumns,
      pageSize,
    ]),
  );

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => (
      <FlashList
        renderItem={renderPlaceholderItem}
        keyExtractor={keyExtractor}
        key="placeholder"
        data={placeholderData}
        scrollEnabled={false}
        {...flashListProps}
      />
    ),
    [flashListProps, keyExtractor, placeholderData, renderPlaceholderItem],
  );

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(() => loadData(0, true), [loadData]);

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />;
});

// # Paginated FlatList Component

export const PaginatedFlatList = React.forwardRef(function <TItem>(
  {
    data,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    onItemsError,
    onItemsReached,
    onPageError,
    onPageReached,
    pageSize,
    placeholderNumberOfItems: totalPlaceholderItem = DEFAULT_FLATLIST_PLACEHOLDER_COUNT,
    renderItem: _renderItem,
    renderPlaceholderItem,
    viewabilityConfig,
    windowSize = DEFAULT_WINDOW_SIZE,
    ...flatListProps
  }: PaginatedFlatListProps<TItem>,
  ref: React.ForwardedRef<FlatList<PaginatedListItem<TItem>>>,
) {
  // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
  // const dataRef = React.useRef(data);
  // dataRef.current = data;

  const { keyExtractor, loadData, onViewableItemsChanged } = usePagination({
    data,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    onItemsError,
    onItemsReached,
    onPageError,
    onPageReached,
    pageSize,
    windowSize,
  });

  const renderItem = React.useCallback<NonNullable<FlatListProps<PaginatedListItem<TItem>>['renderItem']>>(
    info => {
      return info.item === LOADING_ITEM_DATA
        ? renderPlaceholderItem(info as RNListRenderItemInfo<typeof LOADING_ITEM_DATA>)
        : _renderItem(info as RNListRenderItemInfo<TItem>);
    },
    [_renderItem, renderPlaceholderItem],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <FlatList
          ref={ref}
          key="data"
          data={data}
          keyExtractor={keyExtractor}
          viewabilityConfig={viewabilityConfig ?? DEFAULT_VIEWABILIBY_CONFIG}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshControl={refreshControl}
          renderItem={renderItem}
          {...flatListProps}
        />
      );
    },
    [data, flatListProps, keyExtractor, onViewableItemsChanged, ref, renderItem, viewabilityConfig],
  );

  // useState is used instead of useRef with a readonly manner to be able to use a init function (refs cannot take function as initialiser)
  const [placeholderData] = React.useState(
    React.useCallback(() => {
      return new Array(totalPlaceholderItem).fill(LOADING_ITEM_DATA) as (typeof LOADING_ITEM_DATA)[];
    }, [totalPlaceholderItem]),
  );

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => (
      <FlatList
        renderItem={renderPlaceholderItem}
        key="placeholder"
        data={placeholderData}
        scrollEnabled={false}
        {...(flatListProps as Pick<PaginatedFlatListProps<typeof LOADING_ITEM_DATA>, keyof typeof flatListProps>)}
      />
    ),
    [flatListProps, placeholderData, renderPlaceholderItem],
  );

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(() => loadData(0, true), [loadData]);

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />;
});

/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:
/////////////////:

// interface PaginatedListProps<TItem>
//   extends Omit<
//     FlashListProps<TItem>,
//     'onRefresh' | 'refreshing' | 'refreshControl' | 'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout'
//   > {
//   ListComponent?: React.ComponentType<FlatListProps<TItem>>;
//   data?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['data'];
//   keyExtractor?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['keyExtractor'];
//   getItemType?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['getItemType'];
//   overrideItemLayout?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['overrideItemLayout'];

//   /**
//    * render function for items like every List component works
//    */
//   renderItem: NonNullable<FlashListProps<TItem>['renderItem']>;

//   /**
//    * render function for loading items
//    */
//   renderPlaceholderItem: NonNullable<FlashListProps<typeof LOADING_ITEM_DATA>['renderItem']>;

//   /**
//    * Called when a page needs to be loaded beacause one or more loading items are close to the viewport.
//    * @param from first index to load
//    * @param nb number of items to load
//    * @param reloadAll existing data must be flushed
//    * @returns a promise. Updated data needs to be passed with the `data` prop.
//    */
//   onPageReached?: (page: number, reloadAll?: boolean) => Promise<void>;

//   /**
//    * Called when a page needs to be loaded beacause one or more loading items are close to the viewport.
//    * @param from first index to load
//    * @param nb number of items to load
//    * @param reloadAll existing data must be flushed
//    * @returns a promise. Updated data needs to be passed with the `data` prop.
//    */
//   onItemsReached?: (from: number, nb: number, reloadAll?: boolean) => Promise<void>;

//   /**
//    * Called when a page couldn't be loaded (when `onPageReached` has thrown an exception)
//    * @param error the error that is catch
//    * @param from first index to load
//    * @param nb number of items to load
//    * @returns
//    */
//   onItemsError?: (error: any, from: number, nb: number) => void;

//   /**
//    * Called when a page couldn't be loaded (when `onPageReached` has thrown an exception)
//    * @param error the error that is catch
//    * @param from first index to load
//    * @param nb number of items to load
//    * @returns
//    */
//   onPageError?: (error: any, page: number) => void;

//   /**
//    * Size of a page. `onPageReached` will be called with value of `from` a multiple of `pageSize`.
//    */
//   pageSize: number;

//   /**
//    * Exprimed as a mutiplier of `pageSize` value. A value of 1 corresponds to pageSize value.
//    * A distance around the viewport to consider a page needs to be loaded.
//    * Default to 3, that means one page before AND one page after that ones are visible in the viewport.
//    */
//   windowSize?: number;

//   /**
//    * Override the index of visible items to calculate wich page to load.
//    * This is useful when there is a bunch of non-paginated items at the beginning of the data.
//    * @param index the found index of an element
//    * @returns the index to take into account
//    */
//   getVisibleItemIndex?: (index: number) => number;
// }

// export default React.forwardRef(function PaginatedList<TItem>(
//   {
//     data,
//     getVisibleItemIndex,
//     ListComponent = FlashList,
//     onItemsError,
//     onItemsReached,
//     onPageError,
//     onPageReached,
//     pageSize,
//     renderItem: _renderItem,
//     renderPlaceholderItem,
//     viewabilityConfig,
//     windowSize = 3,
//     ...flashListProps
//   }: PaginatedListProps<TItem>,
//   ref: React.ForwardedRef<FlashList<TItem | typeof LOADING_ITEM_DATA>>,
// ) {
//   // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
//   const dataRef = React.useRef(data);
//   dataRef.current = data;

//   // Pages currenlty fetching
//   const loadingPagesRef = React.useRef<Set<number>>(new Set());

//   const loadData = React.useCallback(
//     async (page: number, reloadAll?: boolean) => {
//       try {
//         await onPageReached?.(page, reloadAll);
//         await onItemsReached?.(page * pageSize, pageSize, reloadAll);
//       } catch (e) {
//         onPageError?.(e, page);
//         onItemsError?.(e, page * pageSize, pageSize);
//         throw e;
//       }
//     },
//     [onPageReached, onItemsReached, pageSize, onPageError, onItemsError],
//   );

//   /**
//    * Algorithm here computes which pages are visible for current scroll position & call `loadData` for surrounding pages.
//    */
//   const onViewableItemsChanged = React.useCallback(
//     ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
//       // 1. Get visible item indices
//       let firstVisibleIndex = viewableItems.at(0)?.index;
//       let lastVisibleIndex = viewableItems.at(-1)?.index;
//       if (
//         firstVisibleIndex === undefined ||
//         firstVisibleIndex === null ||
//         lastVisibleIndex === undefined ||
//         lastVisibleIndex === null
//       ) {
//         return;
//       }
//       if (getVisibleItemIndex && firstVisibleIndex !== undefined && firstVisibleIndex !== null)
//         firstVisibleIndex = getVisibleItemIndex(firstVisibleIndex);
//       if (getVisibleItemIndex && lastVisibleIndex !== undefined && lastVisibleIndex !== null)
//         lastVisibleIndex = getVisibleItemIndex(lastVisibleIndex);

//       // 2. Includes windowSize to the computation
//       const windowFirstIndex = firstVisibleIndex - Math.ceil((pageSize * (windowSize - 1)) / 2);
//       const windowLastIndex = lastVisibleIndex + Math.ceil((pageSize * (windowSize - 1)) / 2);

//       // 3. Compute the corresponding page numbers
//       const windowFirstPage = Math.max(0, windowFirstIndex - (windowFirstIndex % pageSize)) / pageSize;
//       const windowLastPage = Math.max(0, windowLastIndex - (windowLastIndex % pageSize)) / pageSize;
//       const windowVisiblePages = Array.from({ length: windowLastPage - windowFirstPage + 1 }, (x, i) => i + windowFirstPage);

//       // 4. Verify the need to load each visible page, and call `loadData` if applicable
//       for (const page of windowVisiblePages) {
//         let mustLoadPage: boolean = false;
//         for (let i = page * pageSize; i < page * pageSize + pageSize; ++i) {
//           if (dataRef.current?.[i] === LOADING_ITEM_DATA) {
//             mustLoadPage = true;
//             break;
//           }
//         }
//         if (mustLoadPage && !loadingPagesRef.current.has(page)) {
//           loadingPagesRef.current.add(page);
//           loadData(page).finally(() => {
//             loadingPagesRef.current.delete(page);
//           });
//         }
//       }
//     },
//     [getVisibleItemIndex, loadData, pageSize, windowSize],
//   );

//   const renderItem = React.useCallback<NonNullable<FlashListProps<TItem | typeof LOADING_ITEM_DATA>['renderItem']>>(
//     info => {
//       return info.item === LOADING_ITEM_DATA
//         ? renderPlaceholderItem(info as ListRenderItemInfo<typeof LOADING_ITEM_DATA>)
//         : _renderItem(info as ListRenderItemInfo<TItem>);
//     },
//     [_renderItem, renderPlaceholderItem],
//   );

//   const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
//     refreshControl => {
//       return (
//         <ListComponent
//           ref={ref}
//           key="data"
//           data={data}
//           viewabilityConfig={viewabilityConfig ?? defaultViewabilityConfig}
//           onViewableItemsChanged={onViewableItemsChanged}
//           refreshControl={refreshControl}
//           renderItem={renderItem}
//           {...flashListProps}
//         />
//       );
//     },
//     [ListComponent, data, flashListProps, onViewableItemsChanged, ref, renderItem, viewabilityConfig],
//   );

//   // useState is used instead of useRef with a readonly manner to be able to use a init function (refs cannot take function as initialiser)
//   const [placeholderData] = React.useState(
//     React.useCallback(() => {
//       const nbElementsInViewport = computeEstimatedVisibleElements(
//         pageSize,
//         flashListProps.estimatedItemSize,
//         flashListProps.estimatedListSize,
//         flashListProps.horizontal,
//         flashListProps.numColumns,
//       );
//       return new Array(nbElementsInViewport).fill(LOADING_ITEM_DATA) as (typeof LOADING_ITEM_DATA)[];
//     }, [
//       flashListProps.estimatedItemSize,
//       flashListProps.estimatedListSize,
//       flashListProps.horizontal,
//       flashListProps.numColumns,
//       pageSize,
//     ]),
//   );

//   const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
//     () => (
//       <ListComponent
//         renderItem={renderPlaceholderItem}
//         key="placeholder"
//         data={placeholderData}
//         scrollEnabled={false}
//         {...flashListProps}
//       />
//     ),
//     [ListComponent, flashListProps, placeholderData, renderPlaceholderItem],
//   );

//   const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(() => loadData(0, true), [loadData]);

//   return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />;
// });
