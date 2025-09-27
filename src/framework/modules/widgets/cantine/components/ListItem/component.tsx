import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { ListItemProps } from './types';

import { BodyText } from '~/framework/components/text';

const ListItem: React.FC<ListItemProps> = ({ item, onPressItem, testID }) => {
  const handlePress = React.useCallback(() => {
    onPressItem?.(item);
  }, [item, onPressItem]);

  return (
    <TouchableOpacity onPress={handlePress} testID={testID} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <BodyText numberOfLines={1} style={styles.name}>
            {item.name}
          </BodyText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListItem;
