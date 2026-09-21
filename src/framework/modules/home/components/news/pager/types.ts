import type { FlatList } from 'react-native';

import type { HorizontalListProps } from '~/framework/components/list/horizontal';

export interface NewsPagerProps<ItemT> extends Omit<HorizontalListProps<ItemT>, 'contentContainerStyle' | 'style'> {
  gap?: number;
  edgeInset?: number;
  listRef?: React.Ref<FlatList<ItemT>>;
}
