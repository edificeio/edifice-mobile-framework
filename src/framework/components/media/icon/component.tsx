import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';

import { Picture } from '../../picture';
import styles from './styles';
import { MediaIconProps } from './types';

export default function MediaIcon({ color, icon, iconSize, style }: MediaIconProps) {
  return (
    <View style={[styles.mediaIcon, style]}>
      <Picture type="NamedSvg" name={icon} width={iconSize} height={iconSize} fill={color || theme.ui.text.inverse} />
    </View>
  );
}
