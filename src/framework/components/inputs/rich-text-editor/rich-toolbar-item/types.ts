import { RichEditor, RichToolbar } from '..';
import { RichToolbarPage } from '../rich-toolbar-page';

export interface RichToolbarItemProps {
  editor: RichEditor;
  icon: string;
  index: number;
  pages: (typeof RichToolbarPage)[];
  toolbar: RichToolbar;
  selected: boolean;
  onSelected: () => void;
}
