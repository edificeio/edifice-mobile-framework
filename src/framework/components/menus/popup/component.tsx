import * as React from 'react';
import { Platform, View } from 'react-native';

import { MenuView } from '@react-native-menu/menu';

import { MenuProps } from '~/framework/components/menus/types/types';

const PopupMenu = (props: React.PropsWithChildren<MenuProps>) => {
  let id = -1;
  const actionsPopup = props.actions.map(action => {
    id++;
    return {
      attributes: {
        destructive: action.destructive ?? false,
      },
      id: id.toString(),
      image: action.icon ? action.icon[Platform.OS] : '',
      title: action.title,
    };
  });

  return (
    <View>
      <MenuView
        isAnchoredToRight
        onPressAction={({ nativeEvent }) => {
          props.actions[+nativeEvent.event].action();
        }}
        actions={actionsPopup}>
        <View>{props.children}</View>
      </MenuView>
    </View>
  );
};

export default PopupMenu;
