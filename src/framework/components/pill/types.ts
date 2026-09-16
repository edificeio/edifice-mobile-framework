import { ColorValue } from 'react-native';

export interface PillProps {
  bold?: boolean;
  color: ColorValue;
  dot?: ColorValue;
  italic?: boolean;
  size?: 'small' | 'normal' | 'large';
  text: string;
  textColor?: ColorValue;
}
