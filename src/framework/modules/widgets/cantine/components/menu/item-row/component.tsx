import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import { MenuItemLabels } from '~/framework/modules/widgets/cantine/components/menu/item-labels';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';

export interface MenuItemRowProps {
  item: MenuItem;
}

export function MenuItemRow({ item }: Readonly<MenuItemRowProps>) {
  // prefer the name written by the school, else the generic dish name.
  const name = item.designationMenu?.trim() || item.nom;
  return (
    <View style={styles.row}>
      <View style={styles.details}>
        <BodyText>{name}</BodyText>
      </View>
      <MenuItemLabels item={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  details: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
});
