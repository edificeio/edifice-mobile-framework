import { RichToolbar } from '../rich-toolbar';

export interface RichToolbarNavigationButtonProps {
  action: () => void;
  page: number;
  title: string;
  toolbar: RichToolbar;
}
