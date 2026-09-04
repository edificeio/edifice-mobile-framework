import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { WIDGET_ICON_INNER_SIZE } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/constants';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordSectionCardProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';

export function CarnetDeBordSectionCard({ colors, emptyText, icon, onPress, section, title, value }: CarnetDeBordSectionCardProps) {
  const open = React.useCallback(() => onPress(section), [onPress, section]);
  const iconStyle = React.useMemo(
    () => [styles.icon, { backgroundColor: colors.background, borderColor: colors.borders }],
    [colors],
  );

  return (
    <TouchableOpacity style={styles.sectionCard} onPress={open} activeOpacity={0.7}>
      <View style={iconStyle}>
        <Svg name={icon} fill={colors.icon} width={WIDGET_ICON_INNER_SIZE} height={WIDGET_ICON_INNER_SIZE} />
      </View>
      <View style={styles.sectionCardText}>
        <SmallBoldText numberOfLines={1}>{title}</SmallBoldText>
        <SmallText numberOfLines={1} style={value ? undefined : styles.sectionCardEmpty}>
          {value ?? emptyText}
        </SmallText>
      </View>
    </TouchableOpacity>
  );
}
