import { MenuView } from '@react-native-menu/menu';
import * as React from 'react';
import { Platform, View } from 'react-native';

import { MenuProps } from '~/framework/components/menus/types/types';

const PopupMenu = (props: React.PropsWithChildren<MenuProps>) => {
  let id = -1;
  const actionsPopup = props.actions.map(action => {
    id++;
    return {
      id: id.toString(),
      title: action.title,
      image: action.icon ? action.icon[Platform.OS] : '',
      attributes: {
        destructive: action.destructive ?? false,
      },
    };
  });

  return (
    <View {...(props.testID ? { testID: props.testID } : {})}>
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
