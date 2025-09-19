import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceholderMedia } from 'rn-placeholder';

import styles, { BANNER_BASE_HEIGHT } from './styles';
import { CommunityNavbarProps } from './types';

import theme from '~/app/theme';
import http from '~/framework/util/http';
import { Image } from '~/framework/util/media';

export const useCommunityBannerHeight = () => {
  const { top: statusBarHeight } = useSafeAreaInsets();
  return BANNER_BASE_HEIGHT + statusBarHeight;
};

export function CommunityNavbar({ image, style: _style }: Readonly<CommunityNavbarProps>) {
  const imageProps = React.useMemo(() => http.imagePropsForSession({ source: { uri: image } }), [image]);
  const height = useCommunityBannerHeight();
  const style = React.useMemo(
    () => [
      styles.banner,
      {
        backgroundColor: image ? theme.palette.grey.white : theme.palette.grey.cloudy,
        height,
      },
      _style,
    ],
    [_style, height, image],
  );
  return (
    <View style={style}>
      <Image style={StyleSheet.absoluteFill} {...imageProps} />
    </View>
  );
}

export function CommunityNavbarPlaceholder({ style: _style }: Readonly<CommunityNavbarProps>) {
  const height = useCommunityBannerHeight();
  const style = React.useMemo(
    () => [
      styles.banner,
      {
        height,
      },
      _style,
    ],
    [_style, height],
  );
  return <PlaceholderMedia style={style} />;
}
