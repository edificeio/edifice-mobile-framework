import * as React from 'react';
import { FlatListProps, View } from 'react-native';

import { Structure } from '../../model';
import ListItem from '../ListItem';
import styles from './styles';
import { ListProps } from './types';

const ItemSeparatorComponent = () => <View style={styles.spacingItem} />;

export const List: React.FC<ListProps> = ({
  borderless = false,
  ListComponent,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  onPressItem,
  refreshControl,
  structuresData,
}) => {
  const listContainerStyle = React.useMemo(() => {
    return borderless ? styles.bottomSheetListContainer : styles.listContainer;
  }, [borderless]);

  const renderItem = React.useCallback(
    ({ item }: { item: Structure }) => <ListItem item={item} onPressItem={onPressItem} />,
    [onPressItem],
  );

  return (
    <ListComponent
      contentContainerStyle={listContainerStyle}
      data={structuresData}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      renderItem={renderItem}
      keyExtractor={React.useCallback<NonNullable<FlatListProps<Structure>['keyExtractor']>>(
        item => `${item.name}-${item.uai}`,
        [],
      )}
    />
  );
};
