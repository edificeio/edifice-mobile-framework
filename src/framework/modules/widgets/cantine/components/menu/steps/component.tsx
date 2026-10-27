import * as React from 'react';

import { I18n } from '~/app/i18n';
import { Stepper } from '~/framework/components/stepper';
import { MenuItemRow } from '~/framework/modules/widgets/cantine/components/menu/item-row';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { MENU_CATEGORIES } from '~/framework/modules/widgets/cantine/model/categories';

export interface MenuStepsProps {
  menuItems: MenuItem[];
  showAllergens?: boolean;
}

export function MenuSteps({ menuItems, showAllergens }: Readonly<MenuStepsProps>) {
  return (
    <Stepper>
      {MENU_CATEGORIES.map(category => {
        const items = menuItems.filter(item => item.type === category.type);
        if (!items.length) return null;
        return (
          <Stepper.Step key={category.type} color={category.color} icon={category.icon} title={I18n.get(category.titleI18n)}>
            {items.map(item => (
              <MenuItemRow key={item.id} item={item} showAllergens={showAllergens} />
            ))}
          </Stepper.Step>
        );
      })}
    </Stepper>
  );
}
