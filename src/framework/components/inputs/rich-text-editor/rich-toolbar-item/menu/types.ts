import { RichToolbarItemProps } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/types';

export interface RichToolbarMenuItemProps extends Omit<RichToolbarItemProps, 'onSelected'> {
  menu: any[];
  onSelected: (menu) => void;
}
