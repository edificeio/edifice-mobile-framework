import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface PopoverAction {
  title: string;
  action: () => void;
  /** One of our own icons, drawn as is: this menu is ours, not the system's. */
  icon?: SvgIconName;
  /** Tints the icon. Without it, an icon keeps the colours it was drawn with. */
  color?: ColorValue;
  /**
   * The app the action belongs to, whose colour then tints the icon. Our module icons are drawn in
   * black, their colour coming from the platform rather than from the file.
   */
  appName?: string;
  /** Coloured and worded as a removal, which takes over the tint. */
  destructive?: boolean;
  disabled?: boolean;
  testID?: string;
}

export interface PopoverProps {
  actions: PopoverAction[];
  /** What opens the menu. Receives whether it is open, to show it. */
  children: ReactNode | ((opened: boolean) => ReactNode);
  disabled?: boolean;
  /** Which side of the anchor the card lines up with. Its end by default, as the design has it. */
  align?: 'start' | 'end';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Where the anchor sits on screen, from which the card is placed. */
export interface PopoverAnchor {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface PopoverMenuProps extends Required<Pick<PopoverProps, 'actions' | 'align'>> {
  anchor: PopoverAnchor;
  onClose: () => void;
}
