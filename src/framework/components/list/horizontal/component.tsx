import * as React from 'react';

import FlatList, { FlatListProps } from '../flat-list';

export default function HorizontalList<ItemT>(props: FlatListProps<ItemT>) {
  return <FlatList horizontal {...props} showsHorizontalScrollIndicator={false} />;
}
