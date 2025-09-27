import { FlatList, FlatListProps } from 'react-native';

import { Structure } from '../../model';

export interface ListProps {
  borderless?: boolean;
  ListComponent: typeof FlatList;
  ListEmptyComponent?: FlatListProps<Structure>['ListEmptyComponent'];
  ListFooterComponent?: FlatListProps<Structure>['ListFooterComponent'];
  ListHeaderComponent?: FlatListProps<Structure>['ListHeaderComponent'];
  onPressItem?: (item: Structure) => void;
  refreshControl?: FlatListProps<Structure>['refreshControl'];
  structuresData: Structure[];
}
