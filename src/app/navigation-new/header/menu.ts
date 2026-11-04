/**
 * The entries of a menu of the header, for both ways to show it:
 * - natively by react-navigation (iOS, with a native icon): `toNativeMenu`;
 * - by `MenuView` of `@react-native-menu/menu` (Android, and iOS with an icon of the app): `toMenuViewActions`, `findMenuAction`.
 *   The `id` of an entry is its `testID` (unique on the screen), which tells which one was pressed.
 * Pure: no component, so it can be tested.
 */
import type { ColorValue } from 'react-native';

import type { MenuAction } from '@react-native-menu/menu';
import type { NativeStackHeaderItemMenu } from '@react-navigation/native-stack';

import type { HeaderMenu, HeaderMenuAction, HeaderMenuEntry } from './types';

type NativeMenu = NativeStackHeaderItemMenu['menu'];
type NativeMenuEntry = NativeMenu['items'][number];

const toNativeEntry = (entry: HeaderMenuEntry): NativeMenuEntry =>
  entry.type === 'action'
    ? {
        ...entry.ios,
        description: entry.description,
        destructive: entry.destructive,
        disabled: entry.disabled,
        hidden: entry.hidden,
        icon: entry.icon?.ios,
        label: entry.label,
        onPress: entry.onPress,
        state: entry.state,
        type: 'action',
      }
    : {
        ...entry.ios,
        description: entry.description,
        destructive: entry.destructive,
        icon: entry.icon?.ios,
        inline: entry.inline,
        items: entry.items.map(toNativeEntry),
        label: entry.label,
        type: 'submenu',
      };

/** The menu of a native item of iOS. The `testID` of the entries is lost: react-native-screens gives no identifier to them. */
export const toNativeMenu = ({ ios, items, title }: HeaderMenu): NativeMenu => ({
  items: items.map(toNativeEntry),
  layout: ios?.layout,
  multiselectable: ios?.multiselectable,
  title,
});

/** Colors of the icons of the entries (react-native-menu needs them explicitly on iOS). */
export interface MenuIconColors {
  regular: ColorValue;
  destructive: ColorValue;
}

/** The icon of an entry for `MenuView`: a name (SF Symbol on iOS, drawable on Android). An image of iOS can't be shown there. */
const getMenuViewImage = (entry: HeaderMenuEntry, platform: 'ios' | 'android') => {
  if (!entry.icon) return undefined;
  if (platform === 'android') return entry.icon.android;
  return entry.icon.ios.type === 'sfSymbol' ? entry.icon.ios.name : undefined;
};

/** The entries as the actions of `MenuView`. */
export const toMenuViewActions = (entries: HeaderMenuEntry[], platform: 'ios' | 'android', colors: MenuIconColors): MenuAction[] =>
  entries.map(entry => ({
    attributes: {
      destructive: entry.destructive,
      ...(entry.type === 'action' && { disabled: entry.disabled, hidden: entry.hidden }),
    },
    id: entry.testID,
    image: getMenuViewImage(entry, platform),
    imageColor: entry.destructive ? colors.destructive : colors.regular,
    subtitle: entry.description,
    title: entry.label,
    ...(entry.type === 'action'
      ? { state: entry.state }
      : { displayInline: entry.inline, subactions: toMenuViewActions(entry.items, platform, colors) }),
  }));

/** The action of the entry pressed in `MenuView` (by its `id`, its `testID`), in the submenus too. */
export const findMenuAction = (entries: HeaderMenuEntry[], id: string): HeaderMenuAction | undefined => {
  for (const entry of entries) {
    if (entry.type === 'action') {
      if (entry.testID === id) return entry;
    } else {
      const found = findMenuAction(entry.items, id);
      if (found) return found;
    }
  }
  return undefined;
};
