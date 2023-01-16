import { MenuView } from '@react-native-menu/menu';
import * as React from 'react';
import { Platform, View } from 'react-native';

import { PopupMenuProps } from './types';

export const PopupMenu = (props: React.PropsWithChildren<PopupMenuProps>) => {
  let id = 0;
  const actionsPopup = props.actions.map(action => {
    id++;
    return {
      id: id.toString(),
      title: action.title,
      image: action.icon[Platform.OS],
      attributes: {
        destructive: action.destructive ?? false,
      },
    };
  });

  return (
    <View>
      <MenuView
        isAnchoredToRight
        onPressAction={({ nativeEvent }) => {
          let idAction = 0;
          props.actions.forEach(action => {
            idAction++;
            if (nativeEvent.event === idAction.toString()) {
              action.action();
            }
          });
        }}
        actions={actionsPopup}>
        <View>{props.children}</View>
      </MenuView>
    </View>
  );
};
