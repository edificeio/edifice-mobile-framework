import { ReactElement } from 'react';

import { RichEditor, RichToolbar } from '..';

export interface RichToolbarPageProps {
  content: ReactElement;
  editor: RichEditor;
  index: number;
  item: RichToolbarItem;
  title: string;
  toolbar: RichToolbar;
}
