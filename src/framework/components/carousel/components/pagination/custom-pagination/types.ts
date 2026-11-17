import { ViewStyle } from 'react-native';

export type DotStyle = Omit<ViewStyle, 'width' | 'height' | 'backgroundColor' | 'borderRadius'> & {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
};
