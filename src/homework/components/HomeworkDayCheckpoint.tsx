import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';

import theme from '~/app/theme';
import Label from '~/framework/components/label';
import { displayDate, getDayOfTheWeek } from '~/framework/util/date';
import { uppercaseFirstLetter } from '~/framework/util/string';
import today from '~/utils/today';

export interface IHomeworkDayCheckpointProps {
  date: moment.Moment;
}

export const HomeworkDayCheckpoint = ({ date }: IHomeworkDayCheckpointProps) => {
  const isPastDate = date.isBefore(today(), 'day');
  const dayOfTheWeek = getDayOfTheWeek(date);
  const dayColor = theme.homeworkDays[dayOfTheWeek];
  const labelColor = isPastDate ? theme.greyPalette.stone : dayColor;
  const formattedDate = displayDate(date.locale(false), 'short');
  const datePrefix = isPastDate ? '' : `${I18n.t('common.for')} `;
  const dateString = uppercaseFirstLetter(`${datePrefix}${formattedDate}`);

  return <Label text={dateString} color={labelColor} />;
};

export default HomeworkDayCheckpoint;
