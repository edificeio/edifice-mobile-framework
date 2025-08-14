import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles, { BANNER_BASE_HEIGHT } from './styles';
import { CommunityNavbarProps } from './types';

import theme from '~/app/theme';
import http from '~/framework/util/http';
import { Image } from '~/framework/util/media';

export function CommunityNavbar({ image }: Readonly<CommunityNavbarProps>) {
  const imageProps = React.useMemo(() => http.imagePropsForSession({ source: { uri: image } }), [image]);
  const { top: statusBarHeight } = useSafeAreaInsets();
  const style = React.useMemo(
    () => [
      styles.banner,
      {
        backgroundColor: image ? theme.palette.grey.white : theme.palette.primary.regular,
        height: BANNER_BASE_HEIGHT + statusBarHeight,
      },
    ],
    [image, statusBarHeight],
  );
  return (
    <View style={style}>
      <Image style={StyleSheet.absoluteFill} {...imageProps} />
    </View>
  );
}
