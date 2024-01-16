import { ColorValue } from 'react-native';

export interface EventButtonProps {
  backgroundColor: ColorValue;
  iconName: string;
  text: string;
  disabled?: boolean;
  isSelected?: boolean;
  onPress: () => void;
}
