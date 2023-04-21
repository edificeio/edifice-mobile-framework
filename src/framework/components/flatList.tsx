import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { FlatList as RNFlatList, FlatListProps as RNFlatListProps, View } from 'react-native';

import { UI_SIZES } from './constants';

export interface FlatListProps<ItemT> extends RNFlatListProps<ItemT> {
  bottomInset?: boolean;
}

function FlatList<ItemT>(props: FlatListProps<ItemT>, ref) {
  const { bottomInset = true, ListFooterComponent, scrollIndicatorInsets, ...otherProps } = props;
  const realListFooterComponent = React.useMemo(() => {
    return bottomInset ? (
      <View style={{ paddingBottom: UI_SIZES.screen.bottomInset }}>{ListFooterComponent}</View>
    ) : (
      ListFooterComponent
    );
  }, [bottomInset, ListFooterComponent]);
  const listRef = React.useRef<RNFlatList>(null);
  useScrollToTop(listRef);
  ref = listRef;
  return (
    <RNFlatList
      {...otherProps}
      ref={listRef}
      ListFooterComponent={realListFooterComponent}
      scrollIndicatorInsets={scrollIndicatorInsets || FlatList.scrollIndicatorInsets} // 🍎 Hack to guarantee the scrollbar sticks to the right edge of the screen.
    />
  );
}
FlatList.scrollIndicatorInsets = { right: 0.001 };
export default React.forwardRef(FlatList);

export function ScrollToTopHandler({ listRef }: { listRef: React.RefObject<RNFlatList<any>> }) {
  useScrollToTop(listRef);
  return null;
}
