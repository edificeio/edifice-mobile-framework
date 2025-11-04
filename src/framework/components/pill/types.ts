import { ColorValue } from 'react-native';

export interface PillProps {
  text: string;
  color: ColorValue;
  size?: 'small' | 'normal' | 'large';
}
