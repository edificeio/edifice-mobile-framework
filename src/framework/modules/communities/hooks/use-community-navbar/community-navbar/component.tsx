import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceholderMedia } from 'rn-placeholder';

import theme from '~/app/theme';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import { Image } from '~/framework/util/media/components/image';
import { sessionImageSource } from '~/framework/util/transport';

import styles, { BANNER_BASE_HEIGHT } from './styles';
import { CommunityNavbarProps } from './types';

export const useCommunityBannerHeight = () => {
  const { top: statusBarHeight } = useSafeAreaInsets();
  return BANNER_BASE_HEIGHT + statusBarHeight;
};

export function CommunityNavbar({ image, style: _style }: Readonly<CommunityNavbarProps>) {
  const appTheme = useAppTheme('communities');
  const source = React.useMemo(() => image && sessionImageSource(image), [image]);
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
      <Image fallback={appTheme as any} style={StyleSheet.absoluteFill} source={source} />
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
