import { RichToolbarItemProps } from '~/framework/components/inputs/rich-text/toolbar/item/types';

export interface RichToolbarCustomItemProps extends RichToolbarItemProps {
  action: () => void;
}
