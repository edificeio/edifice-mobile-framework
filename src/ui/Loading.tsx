import * as React from 'react';
import { ActivityIndicator, ColorValue, View } from 'react-native';

import theme from '~/app/theme';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: object;
}

export const Loading = ({ small, customColor, customStyle }: LoadingProps) => (
  <View style={customStyle || { flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.palette.primary.regular} />
  </View>
);
