import { ReactElement } from 'react';

import { RichEditor } from '~/framework/components/inputs/rich-text-editor';

export interface RichToolbarButtonProps {
  action: () => void;
  editor: RichEditor;
  selected: boolean;
  content: ReactElement;
}
