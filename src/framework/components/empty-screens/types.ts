import { TextProps, ViewStyle } from 'react-native';

export interface EmptyContentProps {
  extraStyle?: ViewStyle;
  svg: string;
  title?: TextProps['children'];
  text?: TextProps['children'];
}
