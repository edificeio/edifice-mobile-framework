import { ColorValue } from 'react-native';

import RichEditor from '~/framework/components/inputs/rich-text-editor/RichEditor';
import { RichToolbar } from '~/framework/components/inputs/rich-text-editor/rich-toolbar/component';

export enum RichToolBarItemTypes {
  ACTION = 'ACTION',
  CUSTOM = 'CUSTOM',
  MENU = 'MENU',
  PAGE = 'PAGE',
  SEPARATOR = 'SEPARATOR',
}

export interface RichToolbarItemProps {
  editor: RichEditor;
  icon: string;
  toolbar: RichToolbar;
  selected: boolean;
  onSelected: () => void;
  fill?: ColorValue;
}
