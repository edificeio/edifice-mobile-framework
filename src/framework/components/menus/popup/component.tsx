import * as React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

import { MenuView } from '@react-native-menu/menu';

import theme from '~/app/theme';
import { MenuProps } from '~/framework/components/menus/types/types';

// We have to explicitly set the icon color on iOS, otherwise react-native-menu doesn't render it
const ICON_COLOR = Platform.OS === 'ios' ? '#000000' : theme.palette.grey.black;
const ICON_COLOR_DESTRUCTIVE = Platform.OS === 'ios' ? '#FF3B30' : theme.palette.status.failure.regular;

const PopupMenu = (props: React.PropsWithChildren<MenuProps>) => {
  let id = -1;
  const actionsPopup = props.actions.map(action => {
    id++;
    return {
      attributes: {
        destructive: action.destructive ?? false,
        disabled: action.disabled ?? false,
      },
      id: id.toString(),
      image: action.icon ? action.icon[Platform.OS] : '',
      imageColor: action.destructive ? ICON_COLOR_DESTRUCTIVE : ICON_COLOR,
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
    <View testID={props.testID}>
      <MenuView
        isAnchoredToRight
        onPressAction={({ nativeEvent }) => {
          if (props.disabled) return;

          const action = props.actions[+nativeEvent.event];
          if (action.disabled) return;

          action.action();
        }}
        actions={actionsPopup}>
        <View>{props.children}</View>
      </MenuView>
    </View>
  );
};

export default PopupMenu;
