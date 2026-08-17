import * as React from 'react';

import HorizontalList, { HorizontalListProps } from '~/framework/components/list/horizontal';

import { CAROUSEL_EDGE_INSET, CAROUSEL_GAP } from './constants';
import { CarouselProps } from './types';

// `HorizontalList` loses the type of its items through `forwardRef`. This alias gives it back, so
const TypedHorizontalList = HorizontalList as unknown as <ItemT>(props: HorizontalListProps<ItemT>) => React.ReactElement;

/**
 * A row of items scrolled sideways. It spans the whole width of the screen: it cancels the padding
 * of the page so an item scrolls past it, then gives that padding back to its content so the first
 * item still starts where the rest of the page does.
 */
export function Carousel<ItemT>({ edgeInset = CAROUSEL_EDGE_INSET, gap = CAROUSEL_GAP, ...listProps }: CarouselProps<ItemT>) {
  const contentContainerStyle = React.useMemo(() => ({ gap, paddingHorizontal: edgeInset }), [edgeInset, gap]);
  const style = React.useMemo(() => ({ marginHorizontal: -edgeInset }), [edgeInset]);

  return (
    <TypedHorizontalList
      {...listProps}
      contentContainerStyle={contentContainerStyle}
      style={style}
      enableScrollToTop={false}
      directionalLockEnabled
    />
  );
}
