import { RichEditor, RichToolbar } from '..';

export interface RichToolbarItemProps {
  active: boolean;
  editor: RichEditor;
  icon: string;
  index: number;
  toolbar: RichToolbar;
  onSelected: () => void;
}
