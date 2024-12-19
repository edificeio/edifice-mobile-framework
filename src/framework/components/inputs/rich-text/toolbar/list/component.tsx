import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { RichToolbarItemsListProps } from './types';

import HorizontalList from '~/framework/components/list/horizontal';

export const RichToolbarItemsList = (props: RichToolbarItemsListProps) => {
  const renderSpaceBetweenItem = () => <View style={styles.separator} />;

  return (
    <HorizontalList
      keyboardShouldPersistTaps="always"
      keyExtractor={(item, index) => index.toString()}
      data={props.list}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      renderItem={({ item }) => item}
      ItemSeparatorComponent={renderSpaceBetweenItem}
      contentContainerStyle={styles.list}
    />
  );
};
