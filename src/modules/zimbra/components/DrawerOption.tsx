import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Icon } from '~/ui';
import { TextBold, Text } from '~/ui/Typography';

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
    const touchableStyle = selected ? [style.item, style.selectedItem] : style.item;
    const iconColor = selected ? '#FFF' : '#000';
    const countString = count ? ` (${count})` : '';
    return (
      <TouchableOpacity style={touchableStyle} onPress={navigate} disabled={selected}>
        <Icon size={22} name={iconName} style={style.itemIcon} color={iconColor} />
        {selected ? (
          <TextBold numberOfLines={1} style={[style.itemTextSelected, style.itemText]}>
            {label + countString}
          </TextBold>
        ) : count ? (
          <TextBold numberOfLines={1} style={style.itemText}>
            {label + countString}
          </TextBold>
        ) : (
          <Text numberOfLines={1} style={style.itemText}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}

const style = StyleSheet.create({
  item: {
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  selectedItem: {
    backgroundColor: '#fc8500',
  },
  itemText: {
    marginLeft: 10,
    fontSize: 18,
    overflow: 'hidden',
    paddingRight: 40,
  },
  itemTextSelected: {
    color: 'white',
  },
  itemIcon: {
    alignSelf: 'center',
    marginHorizontal: 4,
  },
});
