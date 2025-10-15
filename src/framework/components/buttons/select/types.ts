import { FlatList, FlatListProps, ViewStyle } from 'react-native';

import { DefaultButtonProps } from '~/framework/components/buttons/default';

export interface SelectButtonProps<T> extends DefaultButtonProps {
  wrapperStyle: ViewStyle;
  testId?: string;
  // Data for the list
  data?: T[];
  // Callback when an item is pressed
  onItemPress?: (item: T) => void;
  // Custom render function for list items
  renderItem?: (params: { item: T; onPress: () => void }) => React.ReactElement;
  // Custom key extractor for the list
  keyExtractor?: (item: T, index: number) => string;
  // List component to use (defaults to FlatList)
  ListComponent?: typeof FlatList;
  // FlatList props
  ListFooterComponent?: FlatListProps<T>['ListFooterComponent'];
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  refreshControl?: FlatListProps<T>['refreshControl'];
  // Whether the list should be borderless (for bottom sheet)
  borderless?: boolean;
}
