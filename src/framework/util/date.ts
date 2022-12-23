import I18n from 'i18n-js';
import moment, { Moment } from 'moment';

moment.relativeTimeThreshold('m', 60);

export const displayPastDate = (pastDate: Moment, longFormat?: boolean) => {
  const now = moment();

  if (!pastDate || !pastDate.isValid()) {
    return I18n.t('common.date.invalid');
  }

  if (longFormat) {
    if (/*less than 2d*/ pastDate.isSameOrAfter(now.clone().subtract(2, 'day').startOf('day'))) {
      return pastDate.format('LL - H:mm');
    } else return pastDate.format('dddd LL');
  }

  if (/*less than 1min*/ pastDate.isAfter(now.clone().subtract(1, 'minute'))) {
    return I18n.t('common.date.now');
  } else if (/*less than 3h*/ pastDate.isSameOrAfter(now.clone().subtract(3, 'hour'))) {
    return pastDate.fromNow();
  } else if (/*today*/ pastDate.isSame(now, 'day')) {
    return pastDate.format('HH[:]mm');
  } else if (/*yesterday*/ pastDate.clone().add(1, 'day').isSame(now, 'day')) {
    return I18n.t('common.date.yesterday');
  } else if (/*less than 7d*/ pastDate.isSameOrAfter(now.clone().subtract(6, 'day').startOf('day'))) {
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
    return I18n.t('common.date.invalid');
  }

  if (/*yesterday*/ date.clone().add(1, 'day').isSame(now, 'day')) {
    return I18n.t('common.date.yesterday');
  } else if (/*today*/ date.isSame(now, 'day')) {
    return I18n.t('common.date.today');
  } else if (/*tomorrow*/ date.clone().subtract(1, 'day').isSame(now, 'day')) {
    return I18n.t('common.date.tomorrow');
  } else if (/*this year*/ date.isSame(now, 'year')) {
    return date.format(thisYearFormat);
  } /*other year*/ else return date.format(otherYearFormat);
};

export const getDayOfTheWeek = (date: Moment) => {
  if (!date || !date.isValid()) {
    return I18n.t('common.date.invalid');
  }
  return date.locale('en').format('dddd').toLowerCase();
};

export const today = () => {
  return moment();
};
