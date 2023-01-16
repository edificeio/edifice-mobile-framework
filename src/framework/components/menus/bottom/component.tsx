import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import BottomSheet from 'react-native-bottomsheet';

import { MenuProps } from '../types/types';

const BottomMenu = (props: React.PropsWithChildren<MenuProps & { title: string }>) => {
  //add cancel action to actions
  props.actions.push({ title: I18n.t('Cancel'), action: () => {} });

  const showBottomMenu = () => {
    BottomSheet.showBottomSheetWithOptions(
      {
        options: [
          ...props.actions.map(action => {
            return action.title;
          }),
        ],
        title: props.title,
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
