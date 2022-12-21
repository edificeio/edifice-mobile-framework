import { MenuView } from '@react-native-menu/menu';
import * as React from 'react';
import { Platform, View } from 'react-native';

import { PopupMenuProps } from './types';

export const PopupMenu = (props: React.PropsWithChildren<PopupMenuProps>) => {
  const actionsPopup = props.actions.map(action => {
    return {
      id: action.id,
      title: action.title,
      image:
        action.iconAndroid && action.iconIos
          ? Platform.select({
              ios: action.iconIos,
              android: action.iconAndroid,
            })
          : undefined,
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
          props.actions.forEach(action => {
            if (nativeEvent.event === action.id.toString()) {
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
