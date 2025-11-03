import { TextProps, ViewProps } from 'react-native';

export interface EmptyContentProps {
  extraStyle?: ViewProps['style'];
  svg: string;
  title?: TextProps['children'];
  text?: TextProps['children'];
}
