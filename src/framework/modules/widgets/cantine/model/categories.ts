import type { SvgIconName } from '~/framework/components/picture';

import type { MenuItem } from '.';

export interface MenuCategory {
  type: MenuItem['type'];
  titleI18n: string;
  icon: SvgIconName;
}

// listed in serving order.
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    icon: 'ui-salad',
    titleI18n: 'widget-cantine-menu-type-entree',
    type: 'entree',
  },
  {
    icon: 'ui-dish',
    titleI18n: 'widget-cantine-menu-type-plat',
    type: 'plat',
  },
  {
    icon: 'ui-carrot',
    titleI18n: 'widget-cantine-menu-type-accompagnement',
    type: 'accompagnement',
  },
  {
    icon: 'ui-milk',
    titleI18n: 'widget-cantine-menu-type-laitage',
    type: 'laitage',
  },
  {
    icon: 'ui-cookie',
    titleI18n: 'widget-cantine-menu-type-dessert',
    type: 'dessert',
  },
];
