/**
 * ODE Mobile UI - Loading
 * Just dusplay a custom activity indicator
 */
import * as React from 'react';
import { ActivityIndicator, ColorValue, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: ViewStyle;
  withMargins?: boolean;
}

export const LoadingIndicator = ({ small, customColor, customStyle, withMargins }: LoadingProps) => (
  <View
    style={
      customStyle || {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...(withMargins ? { margin: UI_SIZES.spacing.small } : {}),
      }
    }>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.palette.primary.regular} />
  </View>
);
