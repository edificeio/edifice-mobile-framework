import * as React from 'react';
import { ColorValue, FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Asset } from 'react-native-image-picker';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText } from '~/framework/components/text';
import { DocumentPicked, FilePicker } from '~/infra/filePicker';

const styles = StyleSheet.create({
  transparentContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingVertical: UI_SIZES.spacing.tiny,
    borderBottomLeftRadius: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  itemIcon: {
    marginRight: UI_SIZES.spacing.minor,
    color: theme.palette.grey.white,
  },
  itemText: {
    color: theme.palette.grey.white,
  },
});

export type DropdownMenuAction = {
  icon: string;
  text: string;
  isFilePicker?: boolean;
  onPress: () => any;
  onFilePick?: (file: Asset | DocumentPicked) => any;
};

interface IDropdrownMenuProps {
  data: DropdownMenuAction[];
  isVisible: boolean;
  color?: ColorValue;
  onTapOutside: () => any;
}

export const DropdownMenu = ({ data, isVisible, color, onTapOutside }: IDropdrownMenuProps) => {
  const renderAction = ({ item }: { item: DropdownMenuAction }) => {
    const onAction = () => {
      item.onPress();
      onTapOutside();
    };
    return item.isFilePicker ? (
      <FilePicker callback={item.onFilePick!} multiple>
        <View style={styles.itemContainer}>
          <Icon name={item.icon} size={24} style={styles.itemIcon} />
          <SmallBoldText style={styles.itemText}>{item.text}</SmallBoldText>
        </View>
      </FilePicker>
    ) : (
      <TouchableOpacity onPress={onAction}>
        <View style={styles.itemContainer}>
          <Icon name={item.icon} size={24} style={styles.itemIcon} />
          <SmallBoldText style={styles.itemText}>{item.text}</SmallBoldText>
        </View>
      </TouchableOpacity>
    );
  };

  return isVisible ? (
    <TouchableWithoutFeedback onPress={onTapOutside}>
      <View style={styles.transparentContainer}>
        <FlatList
          data={data}
          style={[styles.menuContainer, { backgroundColor: color || theme.palette.primary.regular }]}
          renderItem={renderAction}
          scrollEnabled={false}
        />
      </View>
    </TouchableWithoutFeedback>
  ) : null;
};
