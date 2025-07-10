/**
 * PaginatedList
 * List with pagination handling, with FlashList as list component.
 */

import React from 'react';

import { FlashList, FlashListProps, ListRenderItemInfo, ViewToken } from '@shopify/flash-list';

import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';

export interface PaginatedListProps<TItem>
  extends Omit<
    FlashListProps<TItem>,
    'onRefresh' | 'refreshing' | 'refreshControl' | 'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout'
  > {
  data?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['data'];
  keyExtractor?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['keyExtractor'];
  getItemType?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['getItemType'];
  overrideItemLayout?: FlashListProps<TItem | typeof LOADING_ITEM_DATA>['overrideItemLayout'];

  /**
   * render function for items like every List component works
   */
  renderItem: NonNullable<FlashListProps<TItem>['renderItem']>;

  /**
   * render function for loading items
   */
  renderPlaceholderItem: NonNullable<FlashListProps<typeof LOADING_ITEM_DATA>['renderItem']>;

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

export const LOADING_ITEM_DATA = Symbol('LOADING_ITEM_DATA');

const defaultViewabilityConfig: FlashListProps<unknown>['viewabilityConfig'] = {
  itemVisiblePercentThreshold: 0,
  minimumViewTime: 250,
  waitForInteraction: false,
};

/**
 * Estimates the number of initially displayed items to fill the screen with placeholder elements
 */
const computeEstimatedVisibleElements = (
  pageSize: PaginatedListProps<unknown>['pageSize'],
  estimatedItemSize: PaginatedListProps<unknown>['estimatedItemSize'],
  estimatedListSize: PaginatedListProps<unknown>['estimatedListSize'],
  horizontal: PaginatedListProps<unknown>['horizontal'],
  numColumns: PaginatedListProps<unknown>['numColumns'],
) => {
  if (estimatedListSize === undefined || estimatedItemSize === undefined) return pageSize;
  if (horizontal) return Math.ceil(estimatedListSize.width / estimatedItemSize);
  return Math.ceil(estimatedListSize.height / estimatedItemSize) * (numColumns ?? 1);
};

export default React.forwardRef(function PaginatedList<TItem>(
  {
    data,
    getVisibleItemIndex,
    onItemsError,
    onItemsReached,
    onPageError,
    onPageReached,
    pageSize,
    renderItem: _renderItem,
    renderPlaceholderItem,
    viewabilityConfig,
    windowSize = 3,
    ...flashListProps
  }: PaginatedListProps<TItem>,
  ref: React.ForwardedRef<FlashList<TItem | typeof LOADING_ITEM_DATA>>,
) {
  // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
  const dataRef = React.useRef(data);
  dataRef.current = data;

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
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
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
          if (dataRef.current?.[i] === LOADING_ITEM_DATA) {
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
    [getVisibleItemIndex, loadData, pageSize, windowSize],
  );

  const renderItem = React.useCallback<NonNullable<FlashListProps<TItem | typeof LOADING_ITEM_DATA>['renderItem']>>(
    info => {
      return info.item === LOADING_ITEM_DATA
        ? renderPlaceholderItem(info as ListRenderItemInfo<typeof LOADING_ITEM_DATA>)
        : _renderItem(info as ListRenderItemInfo<TItem>);
    },
    [_renderItem, renderPlaceholderItem],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <FlashList
          ref={ref}
          key="data"
          data={data}
          viewabilityConfig={viewabilityConfig ?? defaultViewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshControl={refreshControl}
          renderItem={renderItem}
          {...flashListProps}
        />
      );
    },
    [data, flashListProps, onViewableItemsChanged, ref, renderItem, viewabilityConfig],
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
        key="placeholder"
        data={placeholderData}
        scrollEnabled={false}
        {...flashListProps}
      />
    ),
    [flashListProps, placeholderData, renderPlaceholderItem],
  );

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(() => loadData(0, true), [loadData]);

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />;
});

export const staleOrSplice = <TItem,>(
  currentData: (TItem | typeof LOADING_ITEM_DATA)[],
  newData: { items: TItem[]; from: number; total: number },
  reloadAll?: boolean,
): (TItem | typeof LOADING_ITEM_DATA)[] => {
  // This complicated algorithm merges old data with new data :
  // - Totals are always replaced
  // - Items are replaced if reloadAll === true OR total number of items has changed
  // - Items are merged else
  const keepOldData = !reloadAll && currentData.length === newData.total;
  const updatedData: (TItem | typeof LOADING_ITEM_DATA)[] = keepOldData
    ? [...currentData]
    : new Array(newData.total).fill(LOADING_ITEM_DATA);
  updatedData.splice(newData.from, newData.items.length, ...newData.items);
  return updatedData;
};
