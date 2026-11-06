import type { MenuItem } from '~/framework/modules/widgets/cantine/model';

export interface MenuItemLabel {
  isShown: (item: MenuItem) => boolean;
  key: string;
  legendI18n: string;
  source: number;
}

export interface MenuItemLabelsProps {
  item: MenuItem;
}
