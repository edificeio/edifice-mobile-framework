import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native';

type CommonProps = {
  label: string;
  leftElement?: ReactNode;
  isPressable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export type MyAppsMenuItemProps =
  (CommonProps & PressableProps & { isPressable?: true }) | (CommonProps & ViewProps & { isPressable: false });
