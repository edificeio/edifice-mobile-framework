import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import styles, { LOADER_ICON_SIZE } from './styles';

import theme from '~/app/theme';

const LoaderItem = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size={LOADER_ICON_SIZE} color={theme.palette.grey.white} />
    </View>
  );
};

export default LoaderItem;
