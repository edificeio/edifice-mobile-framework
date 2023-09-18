import { ReactElement } from 'react';

import RichEditor from '../RichEditor';

export interface RichToolbarButtonProps {
  action: () => void;
  editor: RichEditor;
  selected: boolean;
  content: ReactElement;
}
