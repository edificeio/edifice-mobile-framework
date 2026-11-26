/**
 * Modals of the navigation
 *
 * Tools for the screens presented as a modal (`defineModal`, `presentation` other than `card`): their default options and close
 * button (`modalOptions`, `modalCloseButtonOptions`), and whether a screen is in a modal (`useIsModal`, given by
 * `BaseStackScreenLayout`). A modal that is not a screen is a `NativeModal` (`../native-modal.tsx`); the sheets have their own tools
 * (`sheet.tsx`).
 */
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { StackPresentationTypes } from 'react-native-screens';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { I18n } from '~/util/i18n';

import { androidHeaderRightSpacerStyle } from './options';
import type { StrictScreenConfig } from './screen';
import type { ScreenComponent, ScreenConfig, ScreenOptionsProps } from '../types';

/** The presentations shown as a modal (a `formSheet` or a `pageSheet` too). */
export const modalPresentations: (StackPresentationTypes | 'card')[] = [
  'containedModal',
  'containedTransparentModal',
  'formSheet',
  'fullScreenModal',
  'modal',
  'pageSheet',
  'transparentModal',
];

const IsModalContext = React.createContext(false);

/**
 * Tells whether the screen is presented as a modal (`modal`, `formSheet`, `pageSheet`...) or as a card.
 * A screen of a navigator nested in a modal (e.g. the sign-in screens in the add-account modal) is in a modal too.
 * Use it to adjust insets and margins: a modal has no status bar nor home indicator zone under it, a card does.
 *
 * The presentation is a screen option, and options are not reachable from the screens (`useNavigation` can only set them):
 * `BaseStackScreenLayout` gives them through this context.
 */
export const useIsModal = () => React.useContext(IsModalContext);

/**
 * Provides `useIsModal` to the screen it wraps. Used by `BaseStackScreenLayout`.
 * It is a component (not a hook) because the screen layout is called as a function by the navigator, hooks can't be used there.
 */
export function IsModalProvider({ children, presentedAsModal }: React.PropsWithChildren<{ presentedAsModal: boolean }>) {
  const insideModal = useIsModal();
  return <IsModalContext.Provider value={presentedAsModal || insideModal}>{children}</IsModalContext.Provider>;
}

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

/**
 * Same as `defineScreen`, for a modal screen : modal default options are applied under the ones declared by the screen.
 */
export const defineModal = <Component extends ScreenComponent>(config: StrictScreenConfig<Component>) => {
  const { options } = config;
  return {
    ...config,
    options: (props: ScreenOptionsProps) => ({
      ...modalOptions(props),
      ...options?.(props as never),
    }),
  } as ScreenConfig<Component>;
};
