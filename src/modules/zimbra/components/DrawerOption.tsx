import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, BodyText } from '~/framework/components/text';

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.white,
  },
  selectedItem: {
    backgroundColor: theme.palette.secondary.regular,
  },
  itemText: {
    marginHorizontal: UI_SIZES.spacing.small,
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
    const iconColor = selected ? theme.palette.grey.white : theme.palette.grey.black;
    const countString = count ? ` (${count})` : '';
    return (
      <TouchableOpacity style={touchableStyle} onPress={navigate} disabled={selected}>
        <Icon size={22} name={iconName} color={iconColor} />
        {selected ? (
          <BodyBoldText numberOfLines={1} style={[styles.itemTextSelected, styles.itemText]}>
            {label + countString}
          </BodyBoldText>
        ) : count ? (
          <BodyBoldText numberOfLines={1} style={styles.itemText}>
            {label + countString}
          </BodyBoldText>
        ) : (
          <BodyText numberOfLines={1} style={styles.itemText}>
            {label}
          </BodyText>
        )}
      </TouchableOpacity>
    );
  }
}
