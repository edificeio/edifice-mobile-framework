import { TextStyle } from 'react-native';

export interface RichToolbarTextButtonProps {
  text: string;
  textStyle?: TextStyle;
  selected: boolean;
  onSelected: () => void;
}
