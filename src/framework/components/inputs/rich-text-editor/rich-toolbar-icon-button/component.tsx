import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';
import { RichToolbarIconButtonProps } from './types';

export const RichToolbarIconButton = (props: RichToolbarIconButtonProps) => {
  const handleSelected = () => {
    props.onSelected();
  };

  return (
    <TouchableOpacity onPress={handleSelected} style={[styles.item, props.selected ? styles.itemSelected : {}]}>
      <NamedSVG
        name={props.icon}
        fill={theme.palette.grey.black}
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
      />
    </TouchableOpacity>
  );
};
