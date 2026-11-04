import * as React from 'react';

import { I18n } from '~/app/i18n';
import { Stepper, StepperProps, StepperSection } from '~/framework/components/stepper';
import { MenuItemRow } from '~/framework/modules/widgets/cantine/components/menu/item-row';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { MENU_CATEGORIES } from '~/framework/modules/widgets/cantine/model/categories';

export type MenuStepsProps = Omit<StepperProps<MenuItem>, 'keyExtractor' | 'renderItem' | 'sections'> & {
  menuItems: MenuItem[];
  showAllergens?: boolean;
};

const menuItemKey = (item: MenuItem) => String(item.id);

export function MenuSteps({ menuItems, showAllergens, ...stepperProps }: Readonly<MenuStepsProps>) {
  const sections = React.useMemo(
    () =>
      MENU_CATEGORIES.flatMap<StepperSection<MenuItem>>(category => {
        const items = menuItems.filter(item => item.type === category.type);
        return items.length
          ? [{ color: category.color, data: items, icon: category.icon, key: category.type, title: I18n.get(category.titleI18n) }]
          : [];
      }),
    [menuItems],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: MenuItem }) => <MenuItemRow item={item} showAllergens={showAllergens} />,
    [showAllergens],
  );

  return <Stepper {...stepperProps} sections={sections} renderItem={renderItem} keyExtractor={menuItemKey} />;
}
