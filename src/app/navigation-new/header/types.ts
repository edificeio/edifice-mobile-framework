/**
 * Items of the header (see `index.tsx`). Shaped after the items of react-navigation (`unstable_headerLeftItems`,
 * `unstable_headerRightItems`), the most constrained API, with:
 * - only the fields both platforms honor at the first level; the ones of iOS only in `ios`;
 * - a `testID` on every action, required (the framework requires them on its UI components, react-navigation doesn't);
 * - icons of the app (SVG) or a pair of icons (native on iOS).
 * Built by the helpers of `items.ts`: their `type` is internal.
 */
import type { ReactElement } from 'react';

import type {
  NativeStackHeaderItemButton,
  NativeStackHeaderItemCustom,
  NativeStackHeaderItemMenu,
  NativeStackHeaderItemMenuAction,
  NativeStackHeaderItemMenuSubmenu,
  NativeStackHeaderItemProps,
} from '@react-navigation/native-stack';

import type { SvgIconName } from '~/framework/components/picture';

/** An icon of iOS for a native item: an SF Symbol, or an image. */
export type NativeIconIOS = NonNullable<NativeStackHeaderItemButton['icon']>;

/**
 * Icon of a button of the header:
 * - an icon of the app: rendered in React on both platforms (on iOS, the item is then a `custom` one: its `ios` fields don't apply);
 * - or one by platform: a native item on iOS, the icon of the app on Android.
 */
export type HeaderIcon = SvgIconName | { ios: NativeIconIOS; android: SvgIconName };

/** Icon of an entry of a menu: menus are native on both platforms, so no icon of the app (on Android, the name of a drawable). */
export interface HeaderMenuIcon {
  ios: NativeIconIOS;
  android?: string;
}

/** What a button and a menu of the header share. */
interface HeaderActionBase {
  /** Shown when there is no icon; what screen readers say by default (iOS also shows it when the items don't fit). */
  label: string;
  icon?: HeaderIcon;
  /** What tests look for: never translated. */
  testID: string;
  disabled?: boolean;
  /** What screen readers say, when it must differ from `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/** Fields of iOS only, for a native item (without effect on Android, or with an icon of the app). */
type ActionIOSFields = Pick<
  NativeStackHeaderItemButton,
  | 'badge'
  | 'hidesSharedBackground'
  | 'identifier'
  | 'labelStyle'
  | 'sharesBackground'
  | 'tintColor'
  | 'variant'
  | 'visibilityPriority'
  | 'width'
>;

export interface HeaderButton extends HeaderActionBase {
  type: 'button';
  onPress: () => void;
  ios?: ActionIOSFields & Pick<NativeStackHeaderItemButton, 'selected'>;
}

export interface HeaderMenuAction {
  type: 'action';
  label: string;
  /** Secondary text of the entry. */
  description?: string;
  icon?: HeaderMenuIcon;
  /** What tests look for: never translated. Unique on the screen (it identifies the entry on Android). */
  testID: string;
  onPress: () => void;
  state?: NativeStackHeaderItemMenuAction['state'];
  disabled?: boolean;
  destructive?: boolean;
  hidden?: boolean;
  ios?: Pick<NativeStackHeaderItemMenuAction, 'discoverabilityLabel' | 'keepsMenuPresented'>;
}

export interface HeaderMenuSubmenu {
  type: 'submenu';
  label: string;
  /** Secondary text of the entry. */
  description?: string;
  icon?: HeaderMenuIcon;
  /** What tests look for: never translated. Unique on the screen. */
  testID: string;
  items: HeaderMenuEntry[];
  /** Shown in the menu that contains it, as a section, instead of opening. */
  inline?: boolean;
  destructive?: boolean;
  ios?: Pick<NativeStackHeaderItemMenuSubmenu, 'layout' | 'multiselectable'>;
}

export type HeaderMenuEntry = HeaderMenuAction | HeaderMenuSubmenu;

export interface HeaderMenu extends HeaderActionBase {
  type: 'menu';
  /** Shown on top of the menu. */
  title?: string;
  items: HeaderMenuEntry[];
  ios?: ActionIOSFields &
    Pick<NativeStackHeaderItemMenu, 'changesSelectionAsPrimaryAction'> &
    Pick<NativeStackHeaderItemMenu['menu'], 'layout' | 'multiselectable'>;
}

/** A space between two items: always `UI_SIZES.spacing.minor`. */
export interface HeaderSpacing {
  type: 'spacing';
}

/** Any element: a function gets the props of the header (an action that reads hooks renders a component, see `HeaderActionButton`). */
export interface HeaderCustom {
  type: 'custom';
  element: ReactElement | ((props: NativeStackHeaderItemProps) => ReactElement);
  ios?: Pick<NativeStackHeaderItemCustom, 'hidesSharedBackground'>;
}

export type HeaderItem = HeaderButton | HeaderMenu | HeaderSpacing | HeaderCustom;
