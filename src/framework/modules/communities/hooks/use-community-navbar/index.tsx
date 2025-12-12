import React from 'react';
import { Image, Platform, ScrollViewProps, StatusBar, TouchableOpacity, View } from 'react-native';

import { Header, HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommunityNavbar from './community-navbar';
import { BANNER_BASE_HEIGHT } from './community-navbar/styles';
import CommunityScrollViewStickyHeader, { BANNER_ACCELERATION } from './sticky-component';
import styles, { NAVBAR_RIGHT_BUTTON_STYLE } from './styles';
import { CommunityThumbnailNavbarScrollableProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { HeadingXSText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

export { NAVBAR_RIGHT_BUTTON_STYLE } from './styles';
export type { CommunityThumbnailNavbarScrollableProps } from './types';

export default function useCommunityScrollableThumbnail({
  contentContainerStyle: _contentContainerStyle,
  contentInset: _contentInset,
  contentOffset: _contentOffset,
  image,
  onScroll: _onScroll,
  title,
}: CommunityThumbnailNavbarScrollableProps) {
  const { top: statusBarHeight } = useSafeAreaInsets();
  const fixedTitleHeaderStyle = React.useMemo(
    () => [
      styles.titleHeaderWrapper,
      {
        height: UI_SIZES.elements.navbarHeight + statusBarHeight,
        paddingTop: statusBarHeight,
      },
    ],
    [statusBarHeight],
  );
  const fixedTitleHeader = React.useMemo(
    () => (
      <View style={fixedTitleHeaderStyle} key="fixedTitleHeader">
        <View style={styles.titleHeaderInner}>
          <HeadingXSText numberOfLines={1}>{title}</HeadingXSText>
        </View>
      </View>
    ),
    [title, fixedTitleHeaderStyle],
  );
  const banner = React.useMemo(() => <CommunityNavbar image={image} key="banner" />, [image]);
  const placeholderBanner = React.useMemo(() => <CommunityNavbar key="banner" />, []);
  const bannerTotalHeight = BANNER_BASE_HEIGHT + statusBarHeight;

  const [shouldStatusBarDark, setShouldStatusBarDark] = React.useState(false);

  const onScroll = React.useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    event => {
      const newShouldStatusBarDark =
        event.nativeEvent.contentInset.top + event.nativeEvent.contentOffset.y + statusBarHeight / 2 >
        bannerTotalHeight * (1 / BANNER_ACCELERATION);
      if (shouldStatusBarDark !== newShouldStatusBarDark) setShouldStatusBarDark(newShouldStatusBarDark);
      _onScroll?.(event);
    },
    [bannerTotalHeight, shouldStatusBarDark, statusBarHeight, _onScroll],
  );

  const contentContainerStyle = React.useMemo(
    () => [
      Platform.select({
        default: undefined,
        ios: { marginTop: -bannerTotalHeight },
      }),
      _contentContainerStyle,
    ],
    [_contentContainerStyle, bannerTotalHeight],
  );
  const contentInset = React.useMemo(
    () =>
      Platform.select({
        default: _contentInset,
        ios: {
          ..._contentInset,
          bottom: -bannerTotalHeight + (_contentInset?.bottom ?? 0),
          top: bannerTotalHeight + (_contentInset?.top ?? 0),
        },
      }),
    [_contentInset, bannerTotalHeight],
  );
  const contentOffset = React.useMemo(
    () =>
      Platform.select({
        default: _contentOffset,
        ios: { x: _contentOffset?.x ?? 0, y: -bannerTotalHeight + (_contentOffset?.y ?? 0) },
      }),
    [_contentOffset, bannerTotalHeight],
  );

  return [
    [fixedTitleHeader, banner] as const,
    <StatusBar
      key="communitiesScollableThumbnailStatusBar"
      animated
      backgroundColor={'transparent'}
      barStyle={shouldStatusBarDark ? 'dark-content' : 'light-content'}
      translucent
    />,
    {
      contentContainerStyle,
      contentInset,
      contentOffset,
      onScroll,
      StickyHeaderComponent: CommunityScrollViewStickyHeader,
      stickyHeaderIndices: useCommunityScrollableThumbnail.stickyHeaderIndices,
    } as const,
    placeholderBanner,
  ] as const;
}
useCommunityScrollableThumbnail.stickyHeaderIndices = [0, 1];

export const communityNavBar = <NavigationParams extends ParamListBase, RouteName extends string & keyof NavigationParams>(
  { navigation, route }: NativeStackScreenProps<NavigationParams, RouteName>,
  onInfoButton?: () => void,
): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),

  header: () => (
    <View style={{ marginTop: Platform.select({ android: StatusBar.currentHeight, ios: UI_SIZES.screen.topInset }) }}>
      <Header
        title=""
        headerRight={
          onInfoButton
            ? () => (
                <TouchableOpacity style={NAVBAR_RIGHT_BUTTON_STYLE} onPress={onInfoButton}>
                  <Svg
                    name="ui-infoCircle"
                    width={UI_SIZES.elements.icon.small}
                    height={UI_SIZES.elements.icon.small}
                    fill={theme.palette.grey.black}
                  />
                </TouchableOpacity>
              )
            : undefined
        }
        headerShadowVisible={false}
        headerStyle={styles.header}
        headerLeft={headerLeftProps => (
          <HeaderBackButton
            {...headerLeftProps}
            labelVisible={false}
            style={styles.navBarLeftButton}
            onPress={navigation.goBack}
            backImage={Platform.select({
              default: undefined,
              ios: () => (
                <Image
                  style={styles.backButtonImage}
                  source={require('@react-navigation/elements/src/assets/back-icon.png')}
                  fadeDuration={0}
                  testID="back-btn"
                />
              ),
            })}
            tintColor={theme.ui.text.regular.toString()}
          />
        )}
      />
    </View>
  ),
  headerTransparent: true,
});
