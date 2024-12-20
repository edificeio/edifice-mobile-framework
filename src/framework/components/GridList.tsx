/**
 * Grid list for full-screen selectors.
 * Just a FlatList with some default values applied...
 * use `gap` and `gapOutside` props to manage spaces around the items. Give number or [horizontal, vertical].
 */
import * as React from 'react';
import { FlatListProps, ListRenderItemInfo, StyleProp, View, ViewStyle } from 'react-native';

import FlatList from './list/flat-list';

export interface GridListProps<ItemT> extends FlatListProps<ItemT> {
  gap?: number | [number, number]; // distance BETWEEN each item
  gapOutside?: number | [number, number]; // distance around the list in every direction
}

const gridListItemWrapperStyleBase = {
  flexGrow: 0,
  flexShrink: 0,
};

export default React.forwardRef(function GridList<ItemT>(props: GridListProps<ItemT>, ref: React.ForwardedRef<FlatList<ItemT>>) {
  const { columnWrapperStyle, gap, gapOutside, numColumns, renderItem, ...otherProps } = props;
  const realNumColumns = numColumns ?? 2;
  const realGap = gap ?? 0,
    realGapHV = React.useMemo(() => (typeof realGap === 'number' ? [realGap, realGap] : realGap), [realGap]);
  const realGapOutside = gapOutside ?? 0,
    realGapOutsideHV = React.useMemo(
      () => (typeof realGapOutside === 'number' ? [realGapOutside, realGapOutside] : realGapOutside),
      [realGapOutside],
    );
  const gridListItemWrapperStyleCustom = {
    flexBasis: `${100 / realNumColumns}%`,
    paddingHorizontal: realGapHV[0] / 2,
  };
  const getHorizontalGapStyle = React.useCallback(
    (info: ListRenderItemInfo<ItemT>) => ({
      paddingBottom:
        Math.floor(info.index / realNumColumns) + 1 >= Math.ceil((props.data?.length ?? 0) / realNumColumns)
          ? realGapOutsideHV[1]
          : 0,
      paddingTop: info.index < realNumColumns ? realGapOutsideHV[1] : realGapHV[1],
    }),
    [props.data?.length, realGapHV, realGapOutsideHV, realNumColumns],
  );
  const realColumnWrapperStyle: StyleProp<ViewStyle> = [
    {
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginHorizontal: realGapOutsideHV[0] - realGapHV[0] / 2,
    },
    columnWrapperStyle,
  ];
  return (
    <FlatList
      ref={ref}
      renderItem={info => (
        <View style={[gridListItemWrapperStyleBase, gridListItemWrapperStyleCustom, getHorizontalGapStyle(info)]}>
          {renderItem?.(info)}
        </View>
      )}
      numColumns={realNumColumns}
      columnWrapperStyle={realColumnWrapperStyle}
      {...otherProps}
    />
  );
});
