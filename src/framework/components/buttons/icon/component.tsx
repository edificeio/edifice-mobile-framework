import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';
import { IconButtonProps } from './types';

const IconButton = (props: IconButtonProps) => {
  return (
    <TouchableOpacity {...props} onPress={props.action} style={[styles.iconButton, props.style]}>
      <NamedSVG
        name={props.icon}
        fill={props.color ?? theme.palette.grey.graphite}
        width={props.size ?? UI_SIZES.elements.icon.small}
        height={props.size ?? UI_SIZES.elements.icon.small}
      />
    </TouchableOpacity>
  );
};

export default IconButton;
