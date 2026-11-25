import { ColorValue, TextProps, TouchableOpacityProps } from 'react-native';

import { BundleIconName } from '~/framework/components/picture';

export interface DefaultButtonProps extends Omit<TouchableOpacityProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  text?: string;
  iconLeft?: BundleIconName;
  iconRight?: BundleIconName;
  contentColor?: ColorValue;
  url?: string;
  showConfirmation?: boolean;
  requireSession?: boolean;
  loading?: boolean;
  round?: boolean;
  action?: () => void;
  TextComponent?: React.ComponentType<TextProps>;
}
