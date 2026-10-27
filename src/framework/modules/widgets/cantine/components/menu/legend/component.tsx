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

export function MenuLegend() {
  return (
    <View style={styles.container}>
      <BodyBoldText style={styles.title}>{I18n.get('widget-cantine-menu-legend-title')}</BodyBoldText>
      <View style={styles.items}>
        {MENU_ITEM_LABELS.map(({ key, legendI18n, source }) => (
          <View key={key} style={styles.item}>
            <Image source={source} style={styles.icon} />
            <SmallText style={styles.text}>{I18n.get(legendI18n)}</SmallText>
          </View>
        ))}
        <View style={styles.item}>
          <View style={styles.icon}>
            <Svg
              name="ui-alert-triangle"
              fill={theme.palette.grey.graphite}
              height={UI_SIZES.elements.icon.xsmall}
              width={UI_SIZES.elements.icon.xsmall}
            />
          </View>
          <SmallText style={styles.text}>{I18n.get('widget-cantine-menu-allergenes-label')}</SmallText>
        </View>
      </View>
      <SmallBoldText style={styles.text}>{I18n.get('widget-cantine-menu-footer')}</SmallBoldText>
    </View>
  );
}
