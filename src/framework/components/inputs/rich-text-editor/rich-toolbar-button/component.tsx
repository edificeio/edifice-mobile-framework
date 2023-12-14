import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { RichToolbarButtonProps } from './types';

export const RichToolbarButton = (props: RichToolbarButtonProps) => {
  const { editor, action } = props;
  const handleSelected = () => {
    editor.showAndroidKeyboard();
    editor.sendAction(action, 'result');
  };

  return (
    <TouchableOpacity onPress={handleSelected} style={[styles.button, props.selected ? styles.buttonSelected : {}]}>
      {props.content}
    </TouchableOpacity>
  );
};
