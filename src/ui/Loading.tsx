import * as React from 'react';
import { ActivityIndicator, ColorValue, View } from 'react-native';

import theme from '~/app/theme';

interface LoadingProps {
  small?: boolean;
  customColor?: ColorValue;
  customStyle?: object;
}

export const Loading = ({ customColor, customStyle, small }: LoadingProps) => (
  <View style={customStyle || { alignItems: 'center', flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || theme.palette.primary.regular} />
  </View>
);
