import React from 'react';
import { View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText, HeadingLText } from '~/framework/components/text';
import { CollectionStatusColors } from '~/framework/modules/communities/components/announcements/list/item/collection/status';
import styles from '~/framework/modules/communities/components/announcements/list/item/collection/styles';

const CALENDAR_TOP_HEIGHT = getScaleWidth(12);
const CALENDAR_TOP_WIDTH = getScaleWidth(34);

export const DeadlineBadge = ({
  colors,
  deadline,
  isCompleted,
}: Readonly<{ colors: CollectionStatusColors; deadline: Temporal.Instant; isCompleted: boolean }>) => {
  const { day, month } = React.useMemo(() => {
    const language = I18n.getLanguage();
    const shortMonth = deadline.toLocaleString(language, { month: 'short' });

    return {
      day: deadline.toLocaleString(language, { day: 'numeric' }),
      month: shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1),
    };
  }, [deadline]);
  const contentStyle = { color: colors.content };

  return (
    <View style={[styles.dateBadge, { backgroundColor: colors.background }]}>
      <Svg name="ui-calendar-top" width={CALENDAR_TOP_WIDTH} height={CALENDAR_TOP_HEIGHT} style={styles.calendarTop} />
      {isCompleted ? (
        <Svg
          name={'rack'}
          width={UI_SIZES.elements.icon.small * 2}
          height={UI_SIZES.elements.icon.small * 2}
          fill={colors.content}
        />
      ) : (
        <>
          <HeadingLText style={[styles.day, contentStyle]}>{day}</HeadingLText>
          <CaptionText style={[styles.month, contentStyle]}>{month}</CaptionText>
        </>
      )}
    </View>
  );
};

export default DeadlineBadge;
