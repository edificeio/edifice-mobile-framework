import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { CommonStyles } from '~/styles/common/styles';

interface LoadingProps {
  small?: boolean;
  customColor?: string;
  customStyle?: object;
}

export const Loading = ({ small, customColor, customStyle }: LoadingProps) => (
  <View style={customStyle || { flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size={small ? 'small' : 'large'} color={customColor || CommonStyles.primary} />
  </View>
);
