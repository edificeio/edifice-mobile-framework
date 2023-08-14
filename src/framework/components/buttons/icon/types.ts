import { ColorValue, TouchableOpacityProps } from 'react-native';

export interface IconButtonProps extends TouchableOpacityProps {
  name: string;
  color?: ColorValue;
  size?: number;
  action: () => void;
}
