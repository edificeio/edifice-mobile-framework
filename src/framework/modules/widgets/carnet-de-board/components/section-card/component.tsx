import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { SECTION_ICON_INNER_SIZE, SECTION_STYLE } from '~/framework/modules/widgets/carnet-de-board/model/sections';

import styles from './styles';
import { CarnetDeBordSectionCardProps } from './types';

export function CarnetDeBordSectionCard({ emptyText, labels, onPress, section, title }: CarnetDeBordSectionCardProps) {
  const open = React.useCallback(() => onPress(section), [onPress, section]);
  const { colors, icon } = SECTION_STYLE[section];
  const cardStyle = React.useMemo(() => [styles.card, { borderColor: colors.borders }], [colors]);
  const iconStyle = React.useMemo(() => [styles.icon, { backgroundColor: colors.background }], [colors]);

  const Wrapper = labels ? TouchableOpacity : View;

  return (
    <Wrapper style={cardStyle} onPress={open} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={iconStyle}>
          <Svg name={icon} fill={colors.icon} width={SECTION_ICON_INNER_SIZE} height={SECTION_ICON_INNER_SIZE} />
        </View>
        <SmallBoldText style={styles.title}>{title}</SmallBoldText>
        {labels ? (
          <Svg
            name="ui-rafterRight"
            fill={theme.palette.secondary.dark}
            width={UI_SIZES.dimensions.width.larger}
            height={UI_SIZES.dimensions.width.larger}
          />
        ) : null}
      </View>
      {labels ? (
        <View style={styles.labels}>
          <SmallBoldText numberOfLines={1} style={styles.label}>
            {labels.textLabel}
          </SmallBoldText>
          <SmallText numberOfLines={1}>{labels.valueLabel}</SmallText>
        </View>
      ) : (
        <View style={styles.empty}>
          <SmallText numberOfLines={1} style={styles.emptyText}>
            {emptyText}
          </SmallText>
        </View>
      )}
    </Wrapper>
  );
}
