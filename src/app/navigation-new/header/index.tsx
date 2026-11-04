/**
 * Items of the header of a screen, for its `options`. `headerLeftActions(...)` / `headerRightActions(...)` give the fields of each
 * side for both platforms, from items built by the helpers of `items.ts`:
 *
 *     export default defineScreen({
 *       options: ({ navigation }) => ({
 *         title: …,
 *         ...headerRightActions(
 *           headerAction({ label: I18n.get('…'), icon: 'ui-options', onPress: () => navigation.navigate('…'), testID: 'x-options' }),
 *           headerSpacing(),
 *           headerMenu({ label: …, icon: …, testID: 'x-menu', items: [menuAction({ … }), menuSubmenu({ …, items: [...] })] }),
 *           headerCustom(props => <MyHookedAction {...props} />), // an action that reads hooks (see `HeaderActionButton`)
 *         ),
 *       }),
 *     });
 *
 * The items are those of react-navigation (`unstable_headerLeftItems`, see https://reactnavigation.org/docs/native-stack-navigator#action),
 * reduced to what both platforms honor, plus the fields of iOS only in `ios` (see `types.ts`). Each platform reads its own fields:
 * - iOS: `unstable_headerLeftItems` / `unstable_headerRightItems` (they override `headerLeft` / `headerRight`). A button or a menu with
 *   a pair of icons, or without icon, is a native item (its `testID` is its `accessibilityIdentifier`, thanks to our patch of
 *   react-native-screens); with an icon of the app, it is rendered in React (a `custom` item: its `ios` fields don't apply).
 *   Entries of a native menu get no identifier from react-native-screens: their `testID` has no effect there.
 * - Android: `headerLeft` / `headerRight`, the items in a row, rendered in React (see `components.tsx`); menus through `MenuView`.
 *
 * Order: each side starts at the edge of the screen. `headerLeftActions` lists its items from left to right, `headerRightActions`
 * from right to left (the first one is the rightmost, as in UIKit).
 *
 * Giving one side replaces what the screen had there by default: the close button of a modal (left, see `modalCloseButtonOptions`),
 * the spacer that centers the title on Android (right, see `visibleStackScreenOptions`).
 */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type {
  NativeStackHeaderItem,
  NativeStackHeaderItemProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { ScrollToTopGuard } from 'react-native-screens/experimental';

import { UI_SIZES } from '~/framework/components/constants';

import { HeaderActionButton, HeaderMenuButton } from './components';
import { toNativeMenu } from './menu';
import type { HeaderButton, HeaderCustom, HeaderIcon, HeaderItem, HeaderMenu } from './types';

export { HeaderActionButton } from './components';
export type { HeaderActionButtonProps } from './components';
export { headerAction, headerCustom, headerMenu, headerSpacing, menuAction, menuSubmenu } from './items';
export type * from './types';

type Side = 'left' | 'right';

const SPACING = UI_SIZES.spacing.minor;

const styles = StyleSheet.create({
  // Android: space between the buttons and the title, as for the close button of a modal
  left: { alignItems: 'center', flexDirection: 'row', marginRight: SPACING },
  right: { alignItems: 'center', flexDirection: 'row', marginLeft: SPACING },
  spacing: { width: SPACING },
});

/** The icon of the app to draw, on Android or for an item rendered in React. */
const getSvgIcon = (icon: HeaderIcon | undefined) => (icon === undefined || typeof icon === 'string' ? icon : icon.android);

/** Whether the item is native on iOS: a pair of icons, or no icon. */
const isNativeOnIOS = (icon: HeaderIcon | undefined) => typeof icon !== 'string';

const renderCustom = (item: HeaderCustom, props: NativeStackHeaderItemProps) =>
  typeof item.element === 'function' ? item.element(props) : item.element;

/**
 * iOS: an element of React in the navigation bar. Since iPhone iOS 27 (iPadOS 26), UIKit scrolls the content of the screen to the top
 * when the navigation bar is tapped (its title, its empty area: intended). Native items consume the tap, but not the views of React,
 * which don't use gesture recognizers: pressing one would scroll too. `ScrollToTopGuard` (react-native-screens, experimental, built
 * thanks to our patch of its podspec) blocks the system recognizer for what it wraps; it does nothing on older versions.
 * Workaround of https://github.com/facebook/react-native/issues/56061, to remove once fixed upstream.
 */
const guardScrollToTop = (element: React.ReactElement) => <ScrollToTopGuard>{element}</ScrollToTopGuard>;

/** An action (button or menu) rendered in React. */
const renderAction = (item: HeaderButton | HeaderMenu, side: Side, { tintColor }: NativeStackHeaderItemProps) => {
  const common = {
    accessibilityHint: item.accessibilityHint,
    accessibilityLabel: item.accessibilityLabel,
    disabled: item.disabled,
    icon: getSvgIcon(item.icon),
    label: item.label,
    testID: item.testID,
    tintColor,
  };
  return item.type === 'menu' ? (
    <HeaderMenuButton {...common} isAnchoredToRight={side === 'right'} items={item.items} title={item.title} />
  ) : (
    <HeaderActionButton {...common} onPress={item.onPress} />
  );
};

/** iOS: the item of react-navigation. */
const toIOSItem = (item: HeaderItem, side: Side, props: NativeStackHeaderItemProps): NativeStackHeaderItem => {
  switch (item.type) {
    case 'spacing':
      return { spacing: SPACING, type: 'spacing' };
    case 'custom':
      return { ...item.ios, element: guardScrollToTop(renderCustom(item, props)), type: 'custom' };
    case 'button':
    case 'menu': {
      if (!isNativeOnIOS(item.icon)) return { element: guardScrollToTop(renderAction(item, side, props)), type: 'custom' };
      const common = {
        accessibilityHint: item.accessibilityHint,
        accessibilityIdentifier: item.testID, // Read by our patch of react-native-screens (`RNSBarButtonItem.mm`), unknown to the types: see `closeItemIdentifier`
        accessibilityLabel: item.accessibilityLabel,
        disabled: item.disabled,
        icon: typeof item.icon === 'object' ? item.icon.ios : undefined,
        label: item.label,
      };
      if (item.type === 'button') return { ...item.ios, ...common, onPress: item.onPress, type: 'button' };
      // `layout` and `multiselectable` are fields of the menu itself (see `toNativeMenu`): they are taken out of the item. The `_` prefix
      // marks them as unused on purpose (`varsIgnorePattern` of `@typescript-eslint/no-unused-vars`), which sonarjs doesn't know.
      // eslint-disable-next-line sonarjs/no-unused-vars
      const { layout: _layout, multiselectable: _multiselectable, ...ios } = item.ios ?? {};
      return { ...ios, ...common, menu: toNativeMenu(item), type: 'menu' };
    }
  }
};

/** Android: the item rendered in React. */
const renderAndroidItem = (item: HeaderItem, side: Side, props: NativeStackHeaderItemProps) => {
  switch (item.type) {
    case 'spacing':
      return <View style={styles.spacing} />;
    case 'custom':
      return renderCustom(item, props);
    default:
      return renderAction(item, side, props);
  }
};

const toIOSItems = (items: HeaderItem[], side: Side) => (props: NativeStackHeaderItemProps) =>
  items.map(item => toIOSItem(item, side, props));

const toAndroidRow = (items: HeaderItem[], side: Side) =>
  function HeaderItemsRow(props: NativeStackHeaderItemProps) {
    return (
      <View style={styles[side]}>
        {items.map((item, index) => (
          // The items of a row never change (they are fixed when the options are built): their position is their identity
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>{renderAndroidItem(item, side, props)}</React.Fragment>
        ))}
      </View>
    );
  };

/** The items on the left of the header (instead of the back button), from left to right: the first one is at the edge of the screen. */
export const headerLeftActions = (
  ...items: HeaderItem[]
): Pick<NativeStackNavigationOptions, 'headerLeft' | 'unstable_headerLeftItems'> => ({
  headerLeft: toAndroidRow(items, 'left'),
  unstable_headerLeftItems: toIOSItems(items, 'left'),
});

/**
 * The items on the right of the header, **from right to left**: the first one is at the edge of the screen, as in UIKit
 * (`rightBarButtonItems`). Both platforms show them in the order of the screen (left to right), hence the reverse.
 */
export const headerRightActions = (
  ...items: HeaderItem[]
): Pick<NativeStackNavigationOptions, 'headerRight' | 'unstable_headerRightItems'> => {
  const fromLeft = [...items].reverse();
  return {
    headerRight: toAndroidRow(fromLeft, 'right'),
    unstable_headerRightItems: toIOSItems(fromLeft, 'right'),
  };
};
