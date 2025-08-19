import React from 'react';
import { Image, Platform, ScrollViewProps, StatusBar, View } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommunityScrollViewStickyHeader, { BANNER_ACCELERATION } from './sticky-component';
import styles from './styles';
import { CommunityThumbnailNavbarScrollableProps } from './types';
import CommunityNavbar from '../../hooks/use-community-navbar/community-navbar';
import { BANNER_BASE_HEIGHT } from '../../hooks/use-community-navbar/community-navbar/styles';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

export const CommunityThumbnailNavbarScrollable = ({
  children,
  contentContainerStyle: _contentContainerStyle,
  contentInset: _contentInset,
  contentOffset: _contentOffset,
  image,
  onScroll: _onScroll,
  ScrollComponent = ScrollView,
  title,
  ...scrollViewProps
}: CommunityThumbnailNavbarScrollableProps) => {
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
  const fixedTitleHeader = (
    <View style={fixedTitleHeaderStyle}>
      <View style={styles.titleHeaderInner}>
        <HeadingXSText numberOfLines={1}>{title}</HeadingXSText>
      </View>
    </View>
  );
  const banner = <CommunityNavbar image={image} />;

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

  // Note: Weird ScrollView contentContainerStyle behaviour with vertical padding, so we use an inner View to apply the page style (iOS only).
  // Beware : ScrollView children order matters ! This establish the zIndex of the elements relative to each other.
  //          Also, position (as "index") is used to reference which elements are stiucky and how (with `stickyHeaderIndices` and `StickyHeaderComponent`).
  return (
    <>
      <StatusBar
        animated
        backgroundColor={'transparent'}
        barStyle={shouldStatusBarDark ? 'dark-content' : 'light-content'}
        translucent
      />
      <ScrollComponent
        contentContainerStyle={contentContainerStyle}
        contentInset={contentInset}
        contentOffset={contentOffset}
        onScroll={onScroll}
        StickyHeaderComponent={CommunityScrollViewStickyHeader}
        stickyHeaderIndices={CommunityThumbnailNavbarScrollable.stickyHeaderIndices}
        {...scrollViewProps}>
        {fixedTitleHeader}
        {banner}
        {children}
      </ScrollComponent>
    </>
  );
};
CommunityThumbnailNavbarScrollable.stickyHeaderIndices = [0, 1];

export const communityNavBar = <NavigationParams extends ParamListBase, RouteName extends string & keyof NavigationParams>({
  navigation,
  route,
}: NativeStackScreenProps<NavigationParams, RouteName>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
  headerLeft: props => (
    <HeaderBackButton
      {...props}
      labelVisible={false}
      style={styles.navBarButton}
      onPress={navigation.goBack}
      backImage={Platform.select({
        default: undefined,
        ios: () => (
          <Image
            style={styles.backButtonImage}
            source={require('@react-navigation/elements/src/assets/back-icon.png')}
            fadeDuration={0}
          />
        ),
      })}
      tintColor={theme.ui.text.regular.toString()}
    />
  ),
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerTransparent: true,
});

export default CommunityThumbnailNavbarScrollable;
