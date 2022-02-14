/**
 * ODE Mobile UI - Loading
 * Just dusplay a custom activity indicator
 */

import * as React from 'react';
import { View, ActivityIndicator, ViewStyle, ColorValue } from 'react-native';

import theme from '~/app/theme';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: ViewStyle;
}

export const LoadingIndicator = ({ small, customColor, customStyle }: LoadingProps) => (
  <View style={customStyle || { flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.color.secondary.regular} />
  </View>
);
