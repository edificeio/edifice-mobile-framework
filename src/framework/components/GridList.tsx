/**
 * Grid list for full-screen selectors.
 * Just a FlatList with some default values applied...
 * use `gap` and `gapOutside` props to manage spaces around the items. Give number or [horizontal, vertical].
 */
import * as React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, View } from 'react-native';


export interface GridListProps<ItemT> extends FlatListProps<ItemT> {
  gap?: number | [number, number]; // distance BETWEEN each item
  gapOutside?: number | [number, number]; // distance around the list in every direction
}

const gridListItemWrapperStyleBase = {
  flexShrink: 0,
  flexGrow: 0,
};

export default function GridList<ItemT>(props: GridListProps<ItemT>) {
  let { renderItem, numColumns, columnWrapperStyle, gap, gapOutside, ...otherProps } = props;
  const realNumColumns = numColumns ?? 2;
  const realGap = gap ?? 0, realGapHV = typeof realGap === 'number' ? [realGap, realGap] : realGap;
  const realGapOutside = gapOutside ?? 0,
    realGapOutsideHV = typeof realGapOutside === 'number' ? [realGapOutside, realGapOutside] : realGapOutside;
  const gridListItemWrapperStyleCustom = {
    flexBasis: `${100 / realNumColumns}%`,
    paddingHorizontal: realGapHV[0] / 2,
  };
  const getHorizontalGapStyle = React.useCallback(
    (info: ListRenderItemInfo<ItemT>) => ({
      paddingTop: info.index < realNumColumns ? realGapOutsideHV[1] : realGapHV[1],
      paddingBottom:
        Math.floor(info.index / realNumColumns) >= Math.floor((props.data?.length ?? 0) / realNumColumns) ? realGapOutsideHV[1] : 0,
    }),
    [gap, gapOutside, props.data],
  );
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
          marginHorizontal: realGapOutsideHV[0] - realGapHV[0] / 2,
        },
        columnWrapperStyle,
      ]}
      scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
      {...otherProps}
    />
  );
}