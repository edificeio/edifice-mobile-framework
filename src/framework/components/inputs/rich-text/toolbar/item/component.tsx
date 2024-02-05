import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';
import { RichToolbarItemProps } from './types';

export const RichToolbarItem = (props: RichToolbarItemProps) => {
  return (
    <TouchableOpacity onPress={props.onSelected} style={[styles.item, props.selected ? styles.itemSelected : {}]}>
      <NamedSVG
        name={props.icon}
        fill={props.fill ?? theme.palette.grey.black}
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
      />
    </TouchableOpacity>
  );
};
