import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import Label from '~/framework/components/label';
import { displayDate } from '~/framework/util/date';
import { uppercaseFirstLetter } from '~/framework/util/string';
import today from '~/utils/today';

export interface IHomeworkDayCheckpointProps {
  date: moment.Moment;
}

export const HomeworkDayCheckpoint = ({ date }: IHomeworkDayCheckpointProps) => {
  const isPastDate = date.isBefore(today(), 'day');
  const isTodayOrFutureDate = date.isSameOrAfter(today(), 'day');
  const dayOfTheWeek = date.locale('en').format('dddd').toLowerCase();
  const dayColor = theme.days[dayOfTheWeek];
  const labelColor = isPastDate ? theme.greyPalette.stone : dayColor;
  const formattedDate = displayDate(date.locale(false), 'short');
  const datePrefix = isTodayOrFutureDate ? `${I18n.t('common.for')} ` : '';
  const dateString = uppercaseFirstLetter(`${datePrefix}${formattedDate}`);

  return (
    <View
      style={{
        marginBottom: UI_SIZES.spacing.extraSmall,
        marginTop: UI_SIZES.spacing.extraLarge,
      }}>
      <Label text={dateString} color={labelColor} />
    </View>
  );
};

export default HomeworkDayCheckpoint;
