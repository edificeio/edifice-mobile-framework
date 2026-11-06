import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { MENU_ITEM_LABELS } from '~/framework/modules/widgets/cantine/components/menu/item-labels';
import { Image } from '~/framework/util/media-deprecated';

import styles from './styles';

const LEGEND_COLUMNS = 2;

export function MenuLegend() {
  const legendItems = [
    ...MENU_ITEM_LABELS.map(({ key, legendI18n, source }) => (
      <View key={key} style={styles.item}>
        <Image source={source} style={styles.icon} />
        <SmallText style={styles.text}>{I18n.get(legendI18n)}</SmallText>
      </View>
    )),
    <View key="allergens" style={styles.item}>
      <View style={styles.icon}>
        <Svg
          name="ui-alert-triangle"
          fill={theme.palette.cantine.allergens}
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
        />
      </View>
      <SmallText style={[styles.text, styles.allergens]}>{I18n.get('widget-cantine-menu-allergenes-label')}</SmallText>
    </View>,
  ];

  const legendRows: React.ReactElement[][] = [];
  for (let index = 0; index < legendItems.length; index += LEGEND_COLUMNS) {
    legendRows.push(legendItems.slice(index, index + LEGEND_COLUMNS));
  }

  return (
    <View style={styles.container}>
      <BodyBoldText style={styles.title}>{I18n.get('widget-cantine-menu-legend-title')}</BodyBoldText>
      <View style={styles.rows}>
        {legendRows.map(row => (
          <View key={row[0].key} style={styles.row}>
            {row}
            {row.length < LEGEND_COLUMNS ? <View style={styles.item} /> : null}
          </View>
        ))}
      </View>
      <SmallBoldText style={styles.text}>{I18n.get('widget-cantine-menu-footer')}</SmallBoldText>
    </View>
  );
}
