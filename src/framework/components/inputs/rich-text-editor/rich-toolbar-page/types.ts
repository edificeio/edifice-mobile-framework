import { ReactElement } from 'react';

import RichEditor from '~/framework/components/inputs/rich-text-editor/RichEditor';
import { RichToolbarItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/component';
import RichToolbar from '~/framework/components/inputs/rich-text-editor/rich-toolbar/component';

export interface RichToolbarPageProps {
  content: ReactElement;
  editor: RichEditor;
  item: typeof RichToolbarItem;
  title: string;
  toolbar: RichToolbar;
}
