import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { BottomTabBarButtonProps, BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { HeaderTitle, PlatformPressable } from '@react-navigation/elements';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { I18n } from '~/util/i18n';

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
 * Android: the centered title is a React view, as wide as the room left between the header items, so it touches the one on the
 * right when it is long. The header item on the left (back or close button) is `headerButtonSizeAndroid` wide: an empty item of
 * the same width on the right keeps the title centered, with the same margins on both sides.
 * It is only a default: a screen giving its own `headerRight` replaces it.
 */
const androidHeaderRightSpacerStyle = StyleSheet.create({
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

/**
 * Language independent id of the iOS close item, read as `name` by XCUITest (Appium). Without it `name` is the label ("Fermer"),
 * which changes with the language.
 * `accessibilityIdentifier` does not exist in the types of react-navigation, and the item is native: it works only because our patch of
 * `react-native-screens` (`RNSBarButtonItem.mm`) reads it. It is spread in the item (instead of written in it) to avoid the TypeScript
 * error on an unknown property. If the patch stops applying, the close button just gets back its label as `name`: nothing else breaks.
 */
const closeItemIdentifier = { accessibilityIdentifier: 'BackButton' };

const modalCloseButtonStyle = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_SIZES.navigation.headerButtonSizeAndroid,
    minWidth: UI_SIZES.navigation.headerButtonSizeAndroid,
  },
  // Space between the cross and the title (Android): the matching `headerRight` spacer keeps the title centered
  buttonMargin: { marginRight: UI_SIZES.spacing.minor },
});

/**
 * The close button of a modal, as its header items (the native back button never exists in a modal, see `modalOptions`).
 *
 * E2E TESTS: this button must be found with the id `BackButton`, like the back button of a stack screen (whichever platform):
 * - Android: a React Native `Pressable` in `headerLeft`, so `testID="BackButton"` gives `resource-id="BackButton"`.
 * - iOS: a native header item (`unstable_headerLeftItems`, which replaces `headerLeft` on iOS): `accessibilityIdentifier` gives
 *   `name="BackButton"`, thanks to our patch of `react-native-screens` (see `closeItemIdentifier`).
 * Do not use `HeaderButton` of react-navigation here: on Android its `aria-label` does not reach the `content-desc`.
 * It only shows when the screen can go back, unless `always` is set: a screen that is the first of a navigator nested in a modal
 * can't go back inside its own navigator, but still must close the modal (the go back is forwarded to the parent navigation).
 */
export const modalCloseButtonOptions = (
  { navigation }: Pick<ScreenOptionsProps, 'navigation'>,
  { always = false }: { always?: boolean } = {},
): NativeStackNavigationOptions => ({
  // Android (and iOS fallback) close button : `unstable_headerLeftItems` overrides this one on iOS.
  // `accessibilityLabel` is what screen readers say (translated), `testID` is what tests look for (never translated).
  ...(Platform.OS === 'android' && {
    headerRight: ({ canGoBack }) =>
      always || canGoBack ? (
        <View style={androidHeaderRightSpacerStyle.closeButton} />
      ) : (
        <View style={androidHeaderRightSpacerStyle.default} />
      ),
  }),
  headerLeft: ({ canGoBack, tintColor }) =>
    always || canGoBack ? (
      <Pressable
        accessible
        accessibilityLabel={I18n.get('common-close')}
        accessibilityRole="button"
        android_ripple={{ borderless: true, color: UI_SIZES.navigation.headerButtonRippleColor.light, radius: 20 }}
        hitSlop={16}
        onPress={() => navigation.goBack()}
        style={[modalCloseButtonStyle.button, modalCloseButtonStyle.buttonMargin]}
        testID="BackButton">
        <ModalCloseIcon color={tintColor} />
      </Pressable>
    ) : null,

  // iOS Close button: native items have no `testID`, so the id of tests is `accessibilityIdentifier` (see `closeItemIdentifier`)
  unstable_headerLeftItems: ({ canGoBack }) =>
    always || canGoBack
      ? [
          {
            accessibilityLabel: I18n.get('common-close'),
            ...closeItemIdentifier,
            icon: { name: 'xmark', type: 'sfSymbol' },
            label: I18n.get('common-close'),
            onPress: () => navigation.goBack(),
            type: 'button',
          },
        ]
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
