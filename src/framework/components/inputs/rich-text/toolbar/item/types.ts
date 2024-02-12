import { ColorValue } from 'react-native';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import RichToolbar from '~/framework/components/inputs/rich-text/toolbar/component';

export interface RichToolbarItemProps {
  editor: RichEditor;
  icon: string;
  toolbar: RichToolbar;
  selected: boolean;
  onSelected: () => void;
  fill?: ColorValue;
}
