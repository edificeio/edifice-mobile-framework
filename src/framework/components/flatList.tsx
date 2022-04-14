import * as React from 'react';
import { FlatList as RNFlatList, FlatListProps as RNFlatListProps, View } from 'react-native';

import { UI_SIZES } from './constants';

export interface FlatListProps<ItemT> extends RNFlatListProps<ItemT> {
  bottomInset?: boolean;
}

export default function FlatList<ItemT>(props: FlatListProps<ItemT>) {
  const { bottomInset = true, ListFooterComponent, scrollIndicatorInsets, ...otherProps } = props;
  return (
    <RNFlatList
      {...otherProps}
      ListFooterComponent={
        bottomInset ? (
          <View style={{ paddingBottom: UI_SIZES.screen.bottomInset }}>{ListFooterComponent}</View>
        ) : (
          ListFooterComponent
        )
      }
      scrollIndicatorInsets={scrollIndicatorInsets || { right: 0.001 }} // 🍎 Hack to guarantee the scrollbar sticks to the right edge of the screen.
    />
  );
}
