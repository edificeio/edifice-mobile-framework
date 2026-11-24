/**
 * Hooks of the comments thread.
 */
import * as React from 'react';
import type { FlatList } from 'react-native';

import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

/**
 * The height of the tab bar under the screen. 0 out of the tabs: a modal (`comments/reply`) is shown above them, at the root of the
 * navigation, where `useBottomTabBarHeight` would throw.
 */
export const useTabBarHeight = () => React.useContext(BottomTabBarHeightContext) ?? 0;

/** How many times an item not reached yet is tried again (`onScrollToIndexFailed`). */
const SCROLL_TO_INDEX_MAX_RETRIES = 3;
/** Time for the items scrolled near to render and be measured, before trying again (ms). */
const SCROLL_TO_INDEX_RETRY_DELAY = 100;

/**
 * Scrolls the list to an item, its top on the top of the list (`scrollToIndex`, after the render of the data). The list has no
 * `getItemLayout`: an item out of the rendered window is not measured, and can't be reached at once (`scrollToIndex` throws without
 * `onScrollToIndexFailed`). The list then scrolls near it (by the average height of the items) and tries again, a few times at most.
 */
export const useScrollToIndex = <ItemT>(listRef: React.RefObject<FlatList<ItemT> | null>) => {
  const retriesRef = React.useRef(0);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      retriesRef.current = 0;
      requestAnimationFrame(() => listRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0 }));
    },
    [listRef],
  );

  const onScrollToIndexFailed = React.useCallback(
    ({ averageItemLength, index }: { averageItemLength: number; index: number }) => {
      if (retriesRef.current >= SCROLL_TO_INDEX_MAX_RETRIES) return;
      retriesRef.current += 1;
      listRef.current?.scrollToOffset({ animated: false, offset: averageItemLength * index });
      setTimeout(() => listRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0 }), SCROLL_TO_INDEX_RETRY_DELAY);
    },
    [listRef],
  );

  return { onScrollToIndexFailed, scrollToIndex };
};
