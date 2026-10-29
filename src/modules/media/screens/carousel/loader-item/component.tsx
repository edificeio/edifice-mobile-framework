import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import theme from '~/app/theme';

import styles, { LOADER_ICON_SIZE } from './styles';

interface LoaderItemProps {
  transparent?: boolean;
}

const LoaderItem = ({ transparent = false }: LoaderItemProps) => {
  return (
    <View style={[styles.loaderContainer, transparent && styles.transparent]} pointerEvents={transparent ? 'none' : 'auto'}>
      <ActivityIndicator size={LOADER_ICON_SIZE} color={theme.palette.grey.white} />
    </View>
  );
};

export default LoaderItem;
