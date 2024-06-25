import { ColorValue } from 'react-native';

import type RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import type RichToolbar from '~/framework/components/inputs/rich-text/toolbar/component';

export interface RichToolbarItemProps {
  disabled?: boolean;
  editor?: RichEditor;
  icon: string;
  toolbar?: RichToolbar;
  selected?: boolean;
  fill?: ColorValue;
  onSelected?: () => void;
}
