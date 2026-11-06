import * as React from 'react';
import { View } from 'react-native';

import { BodyText, SmallItalicText } from '~/framework/components/text';
import { MenuItemLabels } from '~/framework/modules/widgets/cantine/components/menu/item-labels';
import { formatAllergens, hasAllergens } from '~/framework/modules/widgets/cantine/model/allergens';

import styles from './styles';
import type { MenuItemRowProps } from './types';

export function MenuItemRow({ item, showAllergens }: Readonly<MenuItemRowProps>) {
  // prefer the name written by the school, else the generic dish name.
  const name = item.designationMenu?.trim() || item.nom;
  return (
    <View style={styles.row}>
      <View style={styles.details}>
        <BodyText>{name}</BodyText>
        {showAllergens && hasAllergens(item) ? (
          <SmallItalicText style={styles.allergens}>{formatAllergens(item)}</SmallItalicText>
        ) : null}
      </View>
      <View style={styles.labels}>
        <MenuItemLabels item={item} />
      </View>
    </View>
  );
}
