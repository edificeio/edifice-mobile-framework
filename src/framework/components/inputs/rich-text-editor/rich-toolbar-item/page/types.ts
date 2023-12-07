import { RichToolbarItemProps } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/types';
import { RichToolbarPage } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-page';

export interface RichToolbarPageItemProps extends RichToolbarItemProps {
  page: typeof RichToolbarPage;
}
