/**
 * ODE Mobile UI - Loading
 * Just display a custom activity indicator
 */
import * as React from 'react';
import { ActivityIndicator, ColorValue, View, ViewStyle } from 'react-native';

import { UI_SIZES } from './constants';
import { pageGutterSize } from './page';

import theme from '~/app/theme';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: ViewStyle;
  withVerticalMargins?: boolean;
}

export const LoadingIndicator = ({ customColor, customStyle, small, withVerticalMargins }: LoadingProps) => (
  <View
    style={
      customStyle || {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        ...(withVerticalMargins ? { marginBottom: pageGutterSize, marginTop: UI_SIZES.spacing.minor } : {}),
      }
    }>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.palette.primary.regular} />
  </View>
);
