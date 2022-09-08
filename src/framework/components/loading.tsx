/**
 * ODE Mobile UI - Loading
 * Just display a custom activity indicator
 */
import * as React from 'react';
import { ActivityIndicator, ColorValue, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { pageGutterSize } from './page';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: ViewStyle;
  withVerticalMargins?: boolean;
}

export const LoadingIndicator = ({ small, customColor, customStyle, withVerticalMargins }: LoadingProps) => (
  <View
    style={
      customStyle || {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...(withVerticalMargins ? { marginTop: UI_SIZES.spacing.minor, marginBottom: pageGutterSize } : {}),
      }
    }>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.palette.primary.regular} />
  </View>
);
