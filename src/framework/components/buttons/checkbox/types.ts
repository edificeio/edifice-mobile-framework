import { TextProps, ViewStyle } from 'react-native';

import { CheckboxProps } from '~/framework/components/checkbox';

export interface CheckboxButtonProps extends CheckboxProps {
  title: string;
  customListItemStyle?: ViewStyle;
  TextComponent?: React.ComponentType<TextProps>;
}
