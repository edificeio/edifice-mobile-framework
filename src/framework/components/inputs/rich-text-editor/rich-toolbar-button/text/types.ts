import { TextStyle } from 'react-native';

import { RichToolbarButtonProps } from '../types';

export interface RichToolbarTextButtonProps extends RichToolbarButtonProps {
  text: string;
  textStyle?: TextStyle;
}
