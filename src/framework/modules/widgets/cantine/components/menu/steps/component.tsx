import * as React from 'react';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Stepper, StepperSection } from '~/framework/components/stepper';
import { MenuItemRow } from '~/framework/modules/widgets/cantine/components/menu/item-row';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { MENU_CATEGORIES } from '~/framework/modules/widgets/cantine/model/categories';

import type { MenuStepsProps } from './types';

const menuItemKey = (item: MenuItem) => String(item.id);

export function MenuSteps({ menuItems, showAllergens, ...stepperProps }: Readonly<MenuStepsProps>) {
  const sections = React.useMemo(
    () =>
      MENU_CATEGORIES.flatMap<StepperSection<MenuItem>>(category => {
        const items = menuItems.filter(item => item.type === category.type);
        return items.length
          ? [
              {
                color: theme.palette.cantine.categories[category.type],
                data: items,
                icon: category.icon,
                key: category.type,
                title: I18n.get(category.titleI18n),
              },
            ]
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
