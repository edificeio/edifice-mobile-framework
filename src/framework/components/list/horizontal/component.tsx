import * as React from 'react';
import { FlatList as RNFlatList } from 'react-native';

import styles from './styles';
import { HorizontalListProps } from './types';

import FlatList from '~/framework/components/list/flat-list';

export const HorizontalList = React.forwardRef(function <ItemT>(
  props: HorizontalListProps<ItemT>,
  ref: React.Ref<RNFlatList<ItemT>> | null | undefined
) {
  const { style, ...listProps } = props;
  const realStyle = React.useMemo(() => [styles.list, style], [style]);
  return <FlatList ref={ref} {...listProps} style={realStyle} horizontal showsHorizontalScrollIndicator={false} />;
});
