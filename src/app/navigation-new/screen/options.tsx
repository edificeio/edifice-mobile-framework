import { Platform, StyleSheet, View } from 'react-native';

import { BottomTabBarButtonProps, BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { HeaderTitle, PlatformPressable } from '@react-navigation/elements';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { UI_SIZES } from '~/framework/components/constants';

/**
 * All screens have these options
 */
const commonScreenOptions: NativeStackNavigatorProps['screenOptions'] & BottomTabNavigatorProps['screenOptions'] = {};

/**
 * All stack navigator have these options
 */
const commonStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonScreenOptions,
  scrollEdgeEffects: { bottom: 'automatic', left: 'automatic', right: 'automatic', top: 'automatic' },
};

/**
 * Every stack screen that **hides** navBar have these options
 */
export const hiddenStackScreenOptions: NativeStackNavigatorProps['screenOptions'] = {
  headerShown: false,
};

/**
 * Android: the centered title is a React view, as wide as the room left between the header items, so it touches the one on the
 * right when it is long. The header item on the left (back or close button) is `headerButtonSizeAndroid` wide: an empty item of
 * the same width on the right keeps the title centered, with the same margins on both sides.
 * It is only a default: a screen giving its own `headerRight` replaces it.
 */
export const androidHeaderRightSpacerStyle = StyleSheet.create({
  closeButton: { width: UI_SIZES.navigation.headerButtonSizeAndroid + UI_SIZES.spacing.minor },
  default: { width: UI_SIZES.navigation.headerButtonSizeAndroid },
});

/**
 * Every stack screen that **shows** navBar have these options
 *
 * E2E TESTS (Appium): the identifiers of the header are the same on iOS and Android, in modals or not
 * (see also the comment of `modalCloseButtonOptions`).
 * - Title: `header-title`.
 *   - iOS: the title is the NATIVE one (UIKit truncates it correctly, a React title would overflow under the header items).
 *     It can't carry a `testID`, so its identifier is set natively by `ios/appe/UINavigationBarTitleIdentifier.m`.
 *   - Android: `headerTitleAlign: 'center'` makes react-navigation render the title as a React view (`ScreenStackHeaderCenterView`),
 *     never as the native one. It is given here with a `testID` (`HeaderTitle` of react-navigation forwards it to its text).
 *     A default empty `headerRight` balances the left button, so the title is centered and keeps equal margins when it is long.
 *   - A screen that gives its own `headerTitle` replaces this one on Android: it must then set its own `testID="header-title"`
 *     (an empty title doesn't need one). On iOS a custom `headerTitle` is a React view too, so it needs it as well.
 * - Back button: `BackButton`. It is the NATIVE button (we don't render it, so we can't give it a `testID`):
 *   on iOS UIKit already names it `BackButton`, on Android the patch of `react-native-screens`
 *   (`patches/react-native-screens+*.patch`) does.
 */
export const visibleStackScreenOptions: NativeStackNavigatorProps['screenOptions'] = {
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'center',
  ...(Platform.OS === 'android' && {
    headerRight: () => <View style={androidHeaderRightSpacerStyle.default} />,
    headerTitle: titleProps => <HeaderTitle {...titleProps} testID="header-title" />,
  }),
};
/**
 * Only the root stack navigator have these options
 */
export const rootStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonStackOptions,
};

/**
 * The modals group & the tabStack group must have the same options
 */
export const tabStackOptions: NativeStackNavigatorProps['screenOptions'] = {
  ...commonStackOptions,
  ...visibleStackScreenOptions,
};

/**
 * Button of the tab bar without the ripple of Android: the default one (`PlatformPressable`) draws it with no option to remove it,
 * so its color is made transparent. It does nothing more than the default one (the tab press feedback is in the tab listeners).
 */
const TabBarButton = (props: BottomTabBarButtonProps) => <PlatformPressable {...props} pressColor="transparent" />;

export const tabsOptions: BottomTabNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  ...commonScreenOptions,
  freezeOnBlur: true,
  headerShown: false,
  lazy: true,
  popToTopOnBlur: true,
  tabBarButton: TabBarButton,
  tabBarStyle: {
    backgroundColor: navTheme.colors.background,
    borderTopColor: navTheme.colors.border,
    borderTopWidth: UI_SIZES.border.thin,
  },
});
