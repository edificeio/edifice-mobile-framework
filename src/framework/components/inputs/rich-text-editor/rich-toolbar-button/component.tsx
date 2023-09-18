import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { RichToolbarButtonProps } from './types';

export const RichToolbarButton = (props: RichToolbarButtonProps) => {
  const handleSelected = () => {
    props.action();
  };

  return (
    <TouchableOpacity onPress={handleSelected} style={[styles.button, props.selected ? styles.buttonSelected : {}]}>
      {props.content}
    </TouchableOpacity>
  );
};
