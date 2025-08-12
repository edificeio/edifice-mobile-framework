import { TextProps } from 'react-native';

export interface EmptyContentProps {
  svg: string;
  title?: TextProps['children'];
  text?: TextProps['children'];
}
