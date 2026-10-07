import { StyleSheet } from 'react-native';

import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { HeaderButton } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';

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

const modalCloseButtonStyle = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_SIZES.navigation.headerButtonSizeAndroid,
    minWidth: UI_SIZES.navigation.headerButtonSizeAndroid,
  },
});

/**
 * Options automatically applied to every modal defiend with `defineModal`
 * A modal is presented by UIKit outside of the navigation stack, so the native back button never exists there
 * (even when `canGoBack` is true): `headerBackIcon` has no effect and the close button must be provided as a header item.
 */
export const modalOptions = ({ navigation }: ScreenOptionsProps): NativeStackNavigationOptions => ({
  // Animation for android. On iOS, the native animation is used.
  animation: 'fade_from_bottom',

  // Android (and iOS fallback) : `unstable_headerLeftItems` overrides this one on iOS.
  headerLeft: ({ canGoBack, tintColor }) =>
    canGoBack ? (
      <HeaderButton accessibilityLabel="Close" onPress={() => navigation.goBack()} style={modalCloseButtonStyle.button}>
        <Picture
          type="Svg"
          name="ui-close"
          width={UI_SIZES.elements.navbarIconSize}
          height={UI_SIZES.elements.navbarIconSize}
          fill={tintColor}
        />
      </HeaderButton>
    ) : null,

  // Default modal mode that can be overriden for each modal.
  presentation: 'modal',

  // Close button for modern iOS
  unstable_headerLeftItems: ({ canGoBack }) =>
    canGoBack
      ? [{ icon: { name: 'xmark', type: 'sfSymbol' }, label: 'Close', onPress: () => navigation.goBack(), type: 'button' }]
      : [],
});
