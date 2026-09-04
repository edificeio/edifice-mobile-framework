import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordSectionCardProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import { SECTION_ICON_INNER_SIZE } from '~/framework/modules/widgets/carnet-de-board/model';

export function CarnetDeBordSectionCard({ colors, emptyText, icon, onPress, section, title, value }: CarnetDeBordSectionCardProps) {
  const open = React.useCallback(() => onPress(section), [onPress, section]);
  const iconStyle = React.useMemo(
    () => [styles.icon, { backgroundColor: colors.background, borderColor: colors.borders }],
    [colors],
  );

  const Wrapper = value ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.sectionCard} onPress={open} activeOpacity={0.7}>
      <View style={iconStyle}>
        <Svg name={icon} fill={colors.icon} width={SECTION_ICON_INNER_SIZE} height={SECTION_ICON_INNER_SIZE} />
      </View>
      <View style={styles.sectionCardText}>
        <SmallBoldText numberOfLines={1}>{title}</SmallBoldText>
        <SmallText numberOfLines={1} style={value ? undefined : styles.sectionCardEmpty}>
          {value ?? emptyText}
        </SmallText>
      </View>
    </Wrapper>
  );
}
