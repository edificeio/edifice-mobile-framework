import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, SmallItalicText } from '~/framework/components/text';
import { MenuItemLabels } from '~/framework/modules/widgets/cantine/components/menu/item-labels';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { formatAllergens, hasAllergens } from '~/framework/modules/widgets/cantine/model/allergens';

export interface MenuItemRowProps {
  item: MenuItem;
  showAllergens?: boolean;
}

export function MenuItemRow({ item, showAllergens }: Readonly<MenuItemRowProps>) {
  // prefer the name written by the school, else the generic dish name.
  const name = item.designationMenu?.trim() || item.nom;
  return (
    <View style={styles.row}>
      <View style={styles.details}>
        <BodyText>{name}</BodyText>
        {showAllergens && hasAllergens(item) ? (
          <SmallItalicText style={styles.allergens} numberOfLines={1}>
            {formatAllergens(item)}
          </SmallItalicText>
        ) : null}
      </View>
      <MenuItemLabels item={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  allergens: {
    color: theme.palette.complementary.yellow.regular,
  },
  details: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
});
