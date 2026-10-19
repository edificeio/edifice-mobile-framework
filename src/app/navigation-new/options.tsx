import { Platform, StyleSheet } from 'react-native';

import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { HeaderButton, HeaderTitle } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

import { ScreenOptionsProps } from './types';

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
 * Every stack screen that **shows** navBar have these options
 */
export const visibleStackScreenOptions: NativeStackNavigatorProps['screenOptions'] = {
  headerBackButtonDisplayMode: 'minimal',
  headerTitle: titleProps => <HeaderTitle {...titleProps} testID="header-title" />,
  headerTitleAlign: 'center',
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

export const tabsOptions: BottomTabNavigatorProps['screenOptions'] = {
  ...commonScreenOptions,
  freezeOnBlur: true,
  headerShown: false,
  lazy: true,
  popToTopOnBlur: true,
};

/**
 * Android system "close" icon (`abc_ic_clear_material` from appcompat), 24dp.
 * The project's `ui-close` icon is bigger than the native back arrow, this one is sized like the system icons.
 * It can't be imported from native resources: `abc_*` are library-private and react-native's `Image` can't render XML vector drawables.
 */
const ModalCloseIcon = ({ color }: { color?: string }) => (
  <Svg
    name="ui-android-native-xmark"
    width={UI_SIZES.elements.navbarIconSize}
    height={UI_SIZES.elements.navbarIconSize}
    fill={color}
  />
);

const modalCloseButtonStyle = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_SIZES.navigation.headerButtonSizeAndroid,
    minWidth: UI_SIZES.navigation.headerButtonSizeAndroid,
  },
});

/**
 * The close button of a modal, as its header items (the native back button never exists in a modal, see `modalOptions`).
 * It only shows when the screen can go back, unless `always` is set: a screen that is the first of a navigator nested in a modal
 * can't go back inside its own navigator, but still must close the modal (the go back is forwarded to the parent navigation).
 */
export const modalCloseButtonOptions = (
  { navigation }: Pick<ScreenOptionsProps, 'navigation'>,
  { always = false }: { always?: boolean } = {},
): NativeStackNavigationOptions => ({
  // Android (and iOS fallback) close button : `unstable_headerLeftItems` overrides this one on iOS.
  headerLeft: ({ canGoBack, tintColor }) =>
    always || canGoBack ? (
      <HeaderButton
        accessibilityLabel="Close"
        onPress={() => navigation.goBack()}
        pressColor={UI_SIZES.navigation.headerButtonRippleColor.light}
        style={modalCloseButtonStyle.button}>
        <ModalCloseIcon color={tintColor} />
      </HeaderButton>
    ) : null,

  // iOS Close button
  unstable_headerLeftItems: ({ canGoBack }) =>
    always || canGoBack
      ? [{ icon: { name: 'xmark', type: 'sfSymbol' }, label: 'Close', onPress: () => navigation.goBack(), type: 'button' }]
      : [],
});

/**
 * Options automatically applied to every modal defiend with `defineModal`
 * A modal is presented by UIKit outside of the navigation stack, so the native back button never exists there
 * (even when `canGoBack` is true): `headerBackIcon` has no effect and the close button must be provided as a header item.
 */
export const modalOptions = (props: ScreenOptionsProps): NativeStackNavigationOptions => ({
  // Animation for android. On iOS, the native animation is used.
  animation: 'fade_from_bottom',

  ...modalCloseButtonOptions(props),

  // Default modal mode that can be overriden for each modal.
  presentation: 'modal',

  // Default sheet options for Android. iOS uses the native radii by default.
  sheetCornerRadius: Platform.OS === 'android' ? UI_SIZES.radius.mediumPlus : undefined,
});
