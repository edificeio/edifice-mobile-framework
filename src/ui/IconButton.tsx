import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import { Icon } from '.';

import theme from '~/app/theme';

export const IconButton = (props: {
  iconName: string;
  iconColor?: string;
  iconSize?: number;
  iconStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  disabled?: boolean;
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: theme.color.secondary.regular,
          borderRadius: 15,
          height: 30,
          width: 30,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: props.disabled ? 0.5 : 1,
        },
        props.buttonStyle,
      ]}>
      <Icon name={props.iconName} color={props.iconColor || '#FFFFFF'} size={props.iconSize || 13} style={props.iconStyle} />
    </View>
  );
};
