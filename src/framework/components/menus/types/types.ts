import { MenuAction } from '../actions/index';

export interface MenuProps {
  actions: MenuAction[];
  children: React.ReactNode;
}
