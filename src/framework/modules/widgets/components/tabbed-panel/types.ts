import type { PropsWithChildren, ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

// Where a tab sits in its row, measured rather than computed
export interface TabLayout {
  height: number;
  width: number;
  x: number;
}

export interface TabbedPanelRadius {
  corner?: number; //Corners of the panel and of the tab.
  curve?: number; // How wide the tab spreads into the panel where the two meet
}

export type TabbedPanelProps = PropsWithChildren<{
  background: ColorValue;
  border: ColorValue;
  header?: ReactNode; // The row of tabs the panel rises to. Without it, the panel stays a plain rounded rectangle.
  radius?: TabbedPanelRadius; // Both default to the values of the design. Keep the curve well under the corner.
  style?: StyleProp<ViewStyle>;
}>;

export type TabbedPanelPathProps = Pick<TabbedPanelProps, 'radius'> & {
  height: number;
  width: number;
  tab?: TabLayout;
};
