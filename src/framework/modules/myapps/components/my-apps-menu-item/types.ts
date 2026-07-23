import { PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native';

type CommonProps = {
  label: string;
  leftElement?: React.ReactNode;
  isPressable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export type MyAppsMenuItemProps =
  | (CommonProps & PressableProps & { isPressable?: true })
  | (CommonProps & ViewProps & { isPressable: false });
