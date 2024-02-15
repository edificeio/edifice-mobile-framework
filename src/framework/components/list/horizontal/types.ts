import { FlatListProps } from '~/framework/components/list/flat-list';

export type HorizontalListProps<ItemT> = Omit<FlatListProps<ItemT>, 'horizontal'>;
