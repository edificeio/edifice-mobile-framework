import * as React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/ui/Typography';

const style = StyleSheet.create({
  transparentContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight,
    backgroundColor: 'red',
    borderBottomLeftRadius: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemIcon: {
    marginRight: 8,
    color: 'white',
  },
  itemText: {
    fontSize: 15,
    color: 'white',
  },
});

type DropdrownMenuProps = {
  color?: string;
  data: {
    icon: string;
    text: string;

    onPress: () => any;
  }[];
  isVisible: boolean;

  onTapOutside: () => any;
};

export const DropdownMenu: React.FunctionComponent<DropdrownMenuProps> = (props: DropdrownMenuProps) => {
  const { color, data, isVisible, onTapOutside } = props;
  return isVisible ? (
    <TouchableWithoutFeedback onPress={onTapOutside}>
      <View style={style.transparentContainer}>
        <FlatList
          data={data}
          style={[style.menuContainer, { backgroundColor: color || theme.color.secondary.regular }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                item.onPress();
                onTapOutside();
              }}>
              <View style={style.itemContainer}>
                <Icon name={item.icon} size={24} style={style.itemIcon} />
                <Text style={style.itemText}>{item.text}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  ) : null;
};
