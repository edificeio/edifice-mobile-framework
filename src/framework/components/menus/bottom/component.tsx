import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import BottomSheet from 'react-native-bottomsheet';

import { I18n } from '~/app/i18n';
import { MenuProps } from '~/framework/components/menus/types/types';

const BottomMenu = (props: React.PropsWithChildren<MenuProps & { title?: string }>) => {
  //add cancel action to actions
  props.actions.push({ action: () => {}, title: I18n.get('common-cancel') });

  const showBottomMenu = () => {
    BottomSheet.showBottomSheetWithOptions(
      {
        options: [
          ...props.actions.map(action => {
            return action.title;
          }),
        ],
        ...(props.title ? { title: props.title } : null),
        cancelButtonIndex: props.actions.length - 1,
      },
      index => {
        props.actions[index].action();
      },
    );
  };

  return <TouchableOpacity onPress={showBottomMenu}>{props.children}</TouchableOpacity>;
};

export default BottomMenu;
