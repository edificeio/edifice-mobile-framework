import { RichToolbarPage } from '../../rich-toolbar-page';
import { RichToolbarItemProps } from '../types';

export interface RichToolbarPageItemProps extends RichToolbarItemProps {
  page: typeof RichToolbarPage;
}
