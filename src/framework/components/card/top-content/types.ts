import { ReactElement } from 'react';
import { ColorValue, ViewStyle } from 'react-native';

export interface CardTopContentProps {
  text: string;
  image: ReactElement;
  bold?: boolean;
  textColor?: ColorValue;
  statusText?: string;
  statusIcon?: string;
  statusColor?: ColorValue;
  style?: ViewStyle;
}
