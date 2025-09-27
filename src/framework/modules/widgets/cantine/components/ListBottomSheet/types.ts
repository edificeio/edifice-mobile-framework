import { FlatList, FlatListProps } from 'react-native';

import { Structure } from '../../model';

export interface ListBottomSheetProps {
  ListComponent: typeof FlatList;
  ListFooterComponent?: FlatListProps<Structure>['ListFooterComponent'];
  onPress?: (item: Structure) => void;
  structuresData: Structure[];
}
