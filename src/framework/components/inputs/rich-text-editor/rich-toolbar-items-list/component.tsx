import * as React from 'react';
import { View } from 'react-native';

import HorizontalList from '~/framework/components/list/horizontal';

import styles from './styles';
import { RichToolbarItemsListProps } from './types';

export const RichToolbarItemsList = (props: RichToolbarItemsListProps) => {
  return (
    <HorizontalList
      keyboardShouldPersistTaps="always"
      keyExtractor={(item, index) => index.toString()}
      data={props.list}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => item}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.list}
    />
  );
};
