import { TextStyle } from 'react-native';

import { RichToolbarButtonProps } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-button/types';

export interface RichToolbarTextButtonProps extends RichToolbarButtonProps {
  text: string;
  textStyle?: TextStyle;
}
