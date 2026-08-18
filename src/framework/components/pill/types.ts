import { ColorValue } from 'react-native';

export interface PillProps {
  color: ColorValue;
  italic?: boolean;
  size?: 'small' | 'normal' | 'large';
  text: string;
  textColor?: ColorValue;
}
