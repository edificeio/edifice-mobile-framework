import * as React from 'react';
import { FlatList as RNFlatList, ScrollViewProps } from 'react-native';

import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';

import HorizontalList, { HorizontalListProps } from '~/framework/components/list/horizontal';

import { CAROUSEL_EDGE_INSET, CAROUSEL_GAP } from './constants';
import { CarouselProps } from './types';

// `HorizontalList` loses the type of its items through `forwardRef`. This alias gives it back, so
const TypedHorizontalList = HorizontalList as unknown as <ItemT>(
  props: HorizontalListProps<ItemT> & { ref?: React.Ref<RNFlatList<ItemT>> },
) => React.ReactElement;

/**
 * Scrolls under gesture-handler, so its drag is arbitrated with the one of the tabs. Straight from
 * React Native, the native pager takes the gesture on Android and changes tab:
 * https://github.com/satya164/react-native-tab-view/issues/455#issuecomment-388020003
 **/
const renderScrollComponent = (props: ScrollViewProps) => <GestureScrollView {...props} />;

/**
 * A row of items scrolled sideways. It spans the whole width of the screen: it cancels the padding
 * of the page so an item scrolls past it, then gives that padding back to its content so the first
 * item still starts where the rest of the page does.
 */
export function Carousel<ItemT>({
  edgeInset = CAROUSEL_EDGE_INSET,
  gap = CAROUSEL_GAP,
  listRef,
  ...listProps
}: CarouselProps<ItemT>) {
  const contentContainerStyle = React.useMemo(() => ({ gap, paddingHorizontal: edgeInset }), [edgeInset, gap]);
  const style = React.useMemo(() => ({ marginHorizontal: -edgeInset }), [edgeInset]);

  return (
    <TypedHorizontalList
      {...listProps}
      ref={listRef}
      renderScrollComponent={renderScrollComponent}
      contentContainerStyle={contentContainerStyle}
      style={style}
      enableScrollToTop={false}
      directionalLockEnabled
    />
  );
}
