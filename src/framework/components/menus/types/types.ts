import { MenuAction } from '~/framework/components/menus/actions/index';

export interface MenuProps {
  actions: MenuAction[];
  children: React.ReactNode;
}
