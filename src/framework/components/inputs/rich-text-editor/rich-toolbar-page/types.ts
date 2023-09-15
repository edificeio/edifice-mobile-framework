import { ReactElement } from 'react';

import { RichEditor, RichToolbar } from '..';
import { RichToolbarItem } from '../rich-toolbar-item';

export interface RichToolbarPageProps {
  content: ReactElement;
  editor: RichEditor;
  index: number;
  item: typeof RichToolbarItem;
  title: string;
  toolbar: RichToolbar;
}
