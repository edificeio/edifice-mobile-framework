import { MenuView } from '@react-native-menu/menu';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, View } from 'react-native';

import { PopupMenuProps } from './types';

export const PopupMenu = (props: React.PropsWithChildren<PopupMenuProps>) => {
  const actionsPopup = props.actions.map(action => {
    return {
      id: action.id,
      title: action.type === 'delete' ? I18n.t('delete') : action.title,
      image:
        action.type === 'delete'
          ? Platform.select({
              ios: 'trash',
              android: 'ic_delete_item',
            })
          : action.type === 'external-link'
          ? Platform.select({
              ios: 'arrow.up.right',
              android: 'ic_open_in_browser',
            })
          : action.iconAndroid && action.iconIos
          ? Platform.select({
              ios: action.iconIos,
              android: action.iconAndroid,
            })
          : undefined,
      attributes: {
        destructive: !!(action.destructive || action.type === 'delete'),
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
