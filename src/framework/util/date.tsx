import React from 'react';

import { Temporal } from '@js-temporal/polyfill';
import moment, { DurationInputArg1, DurationInputArg2, Moment } from 'moment';

import { I18n } from '~/app/i18n';

import { uppercaseFirstLetter } from './string';
import { NestedText } from '../components/text';

export enum DayOfTheWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum DayReference {
  PAST,
  TODAY,
  FUTURE,
}

moment.relativeTimeThreshold('m', 60);

export const today = () => {
  return moment();
};

export const addTime = (date: Moment, amount: DurationInputArg1, unit: DurationInputArg2) => {
  return date.clone().add(amount, unit);
};

export const subtractTime = (date: Moment, amount: DurationInputArg1, unit: DurationInputArg2) => {
  return date.clone().subtract(amount, unit);
};

export const getDayOfTheWeek = (date: Moment) => {
  if (!date || !date.isValid()) {
    return I18n.get('date-invalid');
  }
  return date.locale('en').format('dddd').toLowerCase();
};

export const isDateWeekend = (date: Moment) => {
  return date.day() === 6 || date.day() === 0;
};

export const isDateGivenWeekday = (date: Moment, weekdayNumber: number) => {
  const weekday = date.day();
  return weekday === weekdayNumber;
};

export const displayPastDate = (pastDate: Moment, longFormat?: boolean) => {
  const now = moment();

  if (!pastDate || !pastDate.isValid()) {
    return I18n.get('date-invalid');
  }

  if (longFormat) {
    if (/*less than 2d*/ pastDate.isSameOrAfter(subtractTime(now, 2, 'day').startOf('day'))) {
      return pastDate.format('LL - H:mm');
    } else return pastDate.format('dddd LL');
  }

  if (/*less than 1min*/ pastDate.isAfter(subtractTime(now, 1, 'minute'))) {
    return I18n.get('date-now');
  } else if (/*less than 3h*/ pastDate.isSameOrAfter(subtractTime(now, 3, 'hour'))) {
    return pastDate.fromNow();
  } else if (/*today*/ pastDate.isSame(now, 'day')) {
    return pastDate.format('HH[:]mm');
  } else if (/*yesterday*/ addTime(pastDate, 1, 'day').isSame(now, 'day')) {
    return I18n.get('date-yesterday');
  } else if (/*less than 7d*/ pastDate.isSameOrAfter(subtractTime(now, 6, 'day').startOf('day'))) {
    return pastDate.format('dddd');
  } else if (/*this year*/ pastDate.isSame(now, 'year')) {
    return pastDate.format('D MMM');
  } /*before this year*/ else return pastDate.format('D MMM YYYY');
};

export const displayDate = (date: Moment, format?: 'short' | 'extraShort', showHours?: boolean) => {
  const now = moment();
  const isShortFormat = format === 'short';
  const isExtraShortFormat = format === 'extraShort';
  const thisYearFormat = isShortFormat ? 'ddd D MMM' : isExtraShortFormat ? 'DD/MM' : 'dddd D MMMM';
  const otherYearFormat = isShortFormat ? 'ddd D MMM Y' : isExtraShortFormat ? 'DD/MM/YY' : 'dddd D MMMM Y';

  if (!date || !date.isValid()) {
    return I18n.get('date-invalid');
  }

  if (/*yesterday*/ addTime(date, 1, 'day').isSame(now, 'day')) {
    return I18n.get('date-yesterday');
  } else if (/*today*/ date.isSame(now, 'day')) {
    return I18n.get('date-today');
  } else if (/*tomorrow*/ subtractTime(date, 1, 'day').isSame(now, 'day')) {
    return I18n.get('date-tomorrow');
  } else if (/*this year*/ date.isSame(now, 'year')) {
    return date.format(thisYearFormat);
  } /*other year*/ else return date.format(otherYearFormat);
};

export const displayWeekRange = (date: Moment) => {
  const startOfCurrentWeek = today().clone().day(1).startOf('day');
  const startOfDateWeek = date.clone().day(1).startOf('day');
  const endOfDateWeek = addTime(startOfDateWeek, 6, 'day');

  const isLastWeek = startOfDateWeek.isSame(subtractTime(startOfCurrentWeek, 1, 'week'));
  const isCurrentWeek = startOfDateWeek.isSame(startOfCurrentWeek);
  const isNextWeek = startOfDateWeek.isSame(addTime(startOfCurrentWeek, 1, 'week'));
  const isEndOfDateWeekCurrentYear = endOfDateWeek.isSame(today(), 'year');

  const startDateShort = startOfDateWeek.format('D');
  const startDateLong = startOfDateWeek.format('D MMM');
  const endDateShort = endOfDateWeek.format('D');
  const endDateLong = endOfDateWeek.format('D MMM');
  const endDateMonth = uppercaseFirstLetter(endOfDateWeek.format('MMMM'));
  const endDateYear = endOfDateWeek.format('Y');

  return isCurrentWeek
    ? I18n.get('date-week-current')
    : isLastWeek
      ? I18n.get('date-week-last', { endDate: endDateLong, startDate: startDateLong })
      : isNextWeek
        ? I18n.get('date-week-next', { endDate: endDateLong, startDate: startDateLong })
        : I18n.get('date-week-of', {
            endDate: endDateShort,
            month: endDateMonth,
            startDate: startDateShort,
            year: isEndOfDateWeekCurrentYear ? '' : endDateYear,
          });
};

const BASE_INSTANT_FORMATS = {
  'date-small': {
    day: 'numeric',
    month: 'short',
  },
  'time-small': {
    hour: '2-digit',
    minute: '2-digit',
  },
} satisfies Record<`date-${string}` | `time-${string}` | `datetime-${string}`, globalThis.Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof BASE_INSTANT_FORMATS & `date-${string}`;
export type TimeFormat = keyof typeof BASE_INSTANT_FORMATS & `time-${string}`;
export type DateTimeFormat = keyof typeof BASE_INSTANT_FORMATS & `datetime-${string}`;

/**
 * Print a Temporal PlainDate or Instant as date Text Component.
 */
export const TemporalDateText = ({
  format = 'date-small',
  instant,
  relative,
  TextComponent = NestedText,
}: {
  format?: DateFormat | globalThis.Intl.DateTimeFormatOptions;
  instant: Temporal.PlainDate | Temporal.Instant;
  relative?: boolean;
  TextComponent?: typeof NestedText;
}) => {
  const language = I18n.getLanguage();

  if (relative) {
    if (instant instanceof Temporal.Instant) {
      const untilNow = Temporal.Now.instant().since(instant, { smallestUnit: 'minute' });
      if (Math.abs(untilNow.minutes) < 1) return <TextComponent>{I18n.get('date-now')}</TextComponent>;
    }
    const instantAsDate =
      instant instanceof Temporal.Instant ? instant.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate() : instant;
    const daysUntil = instantAsDate.until(Temporal.Now.plainDateISO()).days;
    if (daysUntil === -1) return <TextComponent>{I18n.get('date-tomorrow')}</TextComponent>;
    if (daysUntil === 0) return <TextComponent>{I18n.get('date-today')}</TextComponent>;
    if (daysUntil === 1) return <TextComponent>{I18n.get('date-yesterday')}</TextComponent>;
  }

  return (
    <TextComponent>
      {instant.toLocaleString(language, typeof format === 'string' ? BASE_INSTANT_FORMATS[format] : format)}
    </TextComponent>
  );
};

/**
 * Print a Temporal PlainDate or Instant as time Text Component.
 * Fallback to TemporalDateText if given instant is not the same date as today.
 */
export const TemporalTimeText = ({
  dateFormat = 'date-small',
  instant,
  relative,
  TextComponent = NestedText,
  timeFormat = 'time-small',
}: {
  timeFormat?: TimeFormat | globalThis.Intl.DateTimeFormatOptions;
  dateFormat?: DateFormat | globalThis.Intl.DateTimeFormatOptions;
  instant: Temporal.Instant;
  relative?: boolean;
  TextComponent?: typeof NestedText;
}) => {
  const language = I18n.getLanguage();

  if (relative) {
    const untilNow = Temporal.Now.instant().since(instant, { smallestUnit: 'minute' });
    if (Math.abs(untilNow.minutes) < 1) return <TextComponent>{I18n.get('date-now')}</TextComponent>;
    const instantAsDate =
      instant instanceof Temporal.Instant ? instant.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate() : instant;
    const daysUntil = instantAsDate.until(Temporal.Now.plainDateISO()).days;
    if (daysUntil === -1)
      return (
        <TextComponent>
          {I18n.get('date-tomorrow')}
          {I18n.get('common-space')}
          {instant.toLocaleString(language, typeof timeFormat === 'string' ? BASE_INSTANT_FORMATS[timeFormat] : timeFormat)}
        </TextComponent>
      );
    if (daysUntil === 0)
      return (
        <TextComponent>
          {instant.toLocaleString(language, typeof timeFormat === 'string' ? BASE_INSTANT_FORMATS[timeFormat] : timeFormat)}
        </TextComponent>
      );
    if (daysUntil === 1)
      return (
        <TextComponent>
          {I18n.get('date-yesterday')}
          {I18n.get('common-space')}
          {instant.toLocaleString(language, typeof timeFormat === 'string' ? BASE_INSTANT_FORMATS[timeFormat] : timeFormat)}
        </TextComponent>
      );
  }

  return (
    <TextComponent>
      {instant.toLocaleString(language, typeof dateFormat === 'string' ? BASE_INSTANT_FORMATS[dateFormat] : dateFormat)}
    </TextComponent>
  );
};
