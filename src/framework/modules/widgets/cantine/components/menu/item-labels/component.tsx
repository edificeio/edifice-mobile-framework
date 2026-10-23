import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { Image } from '~/framework/util/media-deprecated';

export interface MenuItemLabelsProps {
  item: MenuItem;
}

const LABELS: { isShown: (item: MenuItem) => boolean; key: string; source: number }[] = [
  { isShown: item => item.bio, key: 'bio', source: require('ASSETS/images/cantine/bio-logo.png') },
  { isShown: item => item.vegetarien, key: 'vegetarien', source: require('ASSETS/images/cantine/vegetarien-logo.png') },
  { isShown: item => item.faitmaison, key: 'faitmaison', source: require('ASSETS/images/cantine/fait-maison-logo.png') },
  { isShown: item => item.local, key: 'local', source: require('ASSETS/images/cantine/produit-local-logo.png') },
];

export function MenuItemLabels({ item }: Readonly<MenuItemLabelsProps>) {
  const labels = LABELS.filter(label => label.isShown(item));
  if (!labels.length) return null;
  return (
    <View style={styles.labels}>
      {labels.map(({ key, source }) => (
        <Image key={key} source={source} style={styles.label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },
  labels: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
  },
});
