import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

import type { MenuItem } from '.';

export interface MenuCategory {
  type: MenuItem['type'];
  titleI18n: string;
  color: ColorValue;
  icon: SvgIconName;
}

// listed in serving order.
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    color: '#64DB9E',
    icon: 'ui-salad',
    titleI18n: 'widget-cantine-menu-type-entree',
    type: 'entree',
  },
  {
    color: '#FF8261',
    icon: 'ui-dish',
    titleI18n: 'widget-cantine-menu-type-plat',
    type: 'plat',
  },
  {
    color: '#738EFC',
    icon: 'ui-carrot',
    titleI18n: 'widget-cantine-menu-type-accompagnement',
    type: 'accompagnement',
  },
  {
    color: '#FDBFFF',
    icon: 'ui-milk',
    titleI18n: 'widget-cantine-menu-type-laitage',
    type: 'laitage',
  },
  {
    color: '#FFD357',
    icon: 'ui-cookie',
    titleI18n: 'widget-cantine-menu-type-dessert',
    type: 'dessert',
  },
];
