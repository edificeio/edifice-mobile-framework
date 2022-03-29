/**
 * Grid list for full-screen selectors.
 * Just a FlatList with some default values applied...
 * use `gap` and `gapOutside` props to manage spaces around the items.
 */
import * as React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, View } from 'react-native';

export interface GridListProps<ItemT> extends FlatListProps<ItemT> {
  gap?: number; // distance BETWEEN each item
  gapOutside?: number; // distance around the list in every direction
}

const gridListItemWrapperStyleBase = {
  flexShrink: 0,
  flexGrow: 0,
};

export default function GridList<ItemT>(props: GridListProps<ItemT>) {
  let { renderItem, numColumns, columnWrapperStyle, gap, gapOutside, ...otherProps } = props;
  const realNumColumns = numColumns ?? 2;
  const realGap = gap ?? 0;
  const realGapOutside = gapOutside ?? 0;
  const gridListItemWrapperStyleCustom = {
    flexBasis: `${100 / realNumColumns}%`,
    paddingHorizontal: realGap / 2,
  };
  const getHorizontalGapStyle = (info: ListRenderItemInfo<ItemT>) => ({
    paddingTop: info.index < realNumColumns ? realGapOutside : realGap,
    paddingBottom:
      Math.floor(info.index / realNumColumns) >= Math.floor((props.data?.length ?? 0) / realNumColumns) ? realGapOutside : 0,
  });
  return (
    <FlatList
      renderItem={info => (
        <View style={[gridListItemWrapperStyleBase, gridListItemWrapperStyleCustom, getHorizontalGapStyle(info)]}>
          {renderItem?.(info)}
        </View>
      )}
      numColumns={realNumColumns}
      columnWrapperStyle={[
        {
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginHorizontal: realGapOutside - realGap / 2,
        },
        columnWrapperStyle,
      ]}
      scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
      {...otherProps}
    />
  );
}
