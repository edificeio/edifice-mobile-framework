import * as React from 'react';
import { View } from 'react-native';

import { ListRenderItem } from '@shopify/flash-list';

import styles from './styles';
import { ResourceGrid } from './types';

import { BodyText, TextSizeStyle } from '~/framework/components/text';

export const estimatedItemSize = TextSizeStyle.Medium.lineHeight * 5 + 4;

export const ResourceExplorerItem: ListRenderItem<ResourceGrid.BaseItemT> = ({ index, item }) => {
  return (
    <View style={styles.item}>
      <BodyText>{item === null ? `(${index})` : item.name}</BodyText>
    </View>
  );
};
