import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { BodyText } from '~/framework/components/text';

import styles from './styles';
import { RichToolbarTextButtonProps } from './types';

export const RichToolbarTextButton = (props: RichToolbarTextButtonProps) => {
  const handleSelected = () => {
    props.onSelected();
  };

  return (
    <TouchableOpacity onPress={handleSelected} style={[styles.item, props.selected ? styles.itemSelected : {}]}>
      <BodyText style={props.textStyle ?? {}}>{props.text}</BodyText>
    </TouchableOpacity>
  );
};
