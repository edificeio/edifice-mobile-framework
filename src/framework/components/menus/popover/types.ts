import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface PopoverAction {
  title: string;
  action: () => void;
  icon?: SvgIconName;
  color?: ColorValue;
  appName?: string;
  destructive?: boolean;
  disabled?: boolean;
  testID?: string;
}

export interface PopoverProps {
  actions: PopoverAction[];
  anchor?: PopoverAnchor;
  children: ReactNode | ((opened: boolean) => ReactNode);
  disabled?: boolean;
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
