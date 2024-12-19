/**
 * Data model for the module homeworkAssistance
 */
import { Moment } from 'moment';

import { getDayOfTheWeek } from '~/framework/util/date';

export interface IExclusion {
  start: Moment;
  end: Moment;
}

export interface IConfig {
  messages: {
    body: string;
    days: string;
    header: string;
    info: string;
    time: string;
  };
  settings: {
    exclusions: IExclusion[];
    openingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    openingTime: {
      start: Moment;
      end: Moment;
    };
  };
}

export interface IService {
  label: string;
  value: number;
}

export const getIsDateValid = (config: IConfig, date: Moment, time: Moment): boolean => {
  const { exclusions, openingDays, openingTime } = config.settings;
  const allowedWeekDays = Object.keys(openingDays).filter(day => openingDays[day]);
  const weekday = getDayOfTheWeek(date.clone());

  if (!allowedWeekDays.includes(weekday)) return false;
  for (const exclusion of exclusions) {
    if (date.isSameOrAfter(exclusion.start, 'day') && date.isSameOrBefore(exclusion.end, 'day')) return false;
  }
  if (!time.isBetween(openingTime.start, openingTime.end, undefined, '[]')) return false;
  return true;
};
