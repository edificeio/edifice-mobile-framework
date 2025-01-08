/**
 * Data model for the module homeworkAssistance
 */
import { Moment } from 'moment';

import { getDayOfTheWeek } from '~/framework/util/date';

export interface Exclusion {
  start: Moment;
  end: Moment;
}

export interface Config {
  messages: {
    body: string;
    days: string;
    descriptionLink: string;
    header: string;
    info: string;
    link: string;
    time: string;
    titleLink: string;
  };
  settings: {
    exclusions: Exclusion[];
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

export interface Resource {
  id: string;
  name: string;
  pictureUrl: string;
  url: string;
  description: string;
}

export interface Service {
  label: string;
  value: number;
}

export const getIsDateValid = (config: Config, date: Moment, time: Moment): boolean => {
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
