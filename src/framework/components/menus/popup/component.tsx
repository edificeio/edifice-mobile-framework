import * as React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

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

  if (props.disabled) {
    return (
      <View style={{ opacity: 0.5 } as ViewStyle} pointerEvents="none">
        {props.children}
      </View>
    );
  }

  return (
    <View>
      <MenuView
        isAnchoredToRight
        onPressAction={({ nativeEvent }) => {
          if (props.disabled) return;

          props.actions[+nativeEvent.event].action();
        }}
        actions={actionsPopup}>
        <View>{props.children}</View>
      </MenuView>
    </View>
  );
};

export default PopupMenu;
