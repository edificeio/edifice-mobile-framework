import { RichToolbarItemProps } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/types';

export interface RichToolbarCustomItemProps extends RichToolbarItemProps {
  action: () => void;
}
