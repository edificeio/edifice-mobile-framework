import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSemiBold, TextSizeStyle } from '~/framework/components/text';

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.palette.grey.white,
  },
  selectedItem: {
    backgroundColor: theme.palette.secondary.regular,
  },
  itemText: {
    ...TextSizeStyle.SlightBig,
    marginLeft: 12,
    overflow: 'hidden',
    paddingRight: 40,
  },
  itemTextSelected: {
    color: theme.palette.grey.white,
  },
});

type DrawerOptionProps = {
  label: string;
  count?: number;
  selected: boolean;
  iconName: string;
  navigate: () => any;
};

export default class DrawerOption extends React.PureComponent<DrawerOptionProps> {
  public render() {
    const { label, selected, iconName, count, navigate } = this.props;
    const touchableStyle = selected ? [styles.item, styles.selectedItem] : styles.item;
    const iconColor = selected ? '#FFF' : '#000';
    const countString = count ? ` (${count})` : '';
    return (
      <TouchableOpacity style={touchableStyle} onPress={navigate} disabled={selected}>
        <Icon size={22} name={iconName} color={iconColor} />
        {selected ? (
          <TextBold numberOfLines={1} style={[styles.itemTextSelected, styles.itemText]}>
            {label + countString}
          </TextBold>
        ) : count ? (
          <TextSemiBold numberOfLines={1} style={styles.itemText}>
            {label + countString}
          </TextSemiBold>
        ) : (
          <Text numberOfLines={1} style={styles.itemText}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}
