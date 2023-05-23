import moment from 'moment';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import Label from '~/framework/components/label';
import { displayDate, getDayOfTheWeek, today } from '~/framework/util/date';
import { uppercaseFirstLetter } from '~/framework/util/string';

export interface IHomeworkDayCheckpointProps {
  date: moment.Moment;
}

export const HomeworkDayCheckpoint = ({ date }: IHomeworkDayCheckpointProps) => {
  const isPastDate = date.isBefore(today(), 'day');
  const dayOfTheWeek = getDayOfTheWeek(date);
  const dayColor = theme.color.homework.days[dayOfTheWeek]?.accent ?? theme.palette.grey.stone;
  const labelColor = isPastDate ? theme.palette.grey.stone : dayColor;
  const formattedDate = displayDate(date.locale(false), 'short');
  const datePrefix = isPastDate ? '' : `${I18n.get('common.for')} `;
  const dateString = uppercaseFirstLetter(`${datePrefix}${formattedDate}`);

  return <Label text={dateString} color={labelColor} />;
};

export default HomeworkDayCheckpoint;
