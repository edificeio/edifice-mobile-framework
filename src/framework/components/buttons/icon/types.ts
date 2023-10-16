import { ColorValue, TouchableOpacityProps } from 'react-native';

export interface IconButtonProps extends TouchableOpacityProps {
  icon: string;
  color?: ColorValue;
  size?: number;
  action: () => void;
}
