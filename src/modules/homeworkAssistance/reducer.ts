/**
 * Homework assistance Reducer
 */
import { Moment } from 'moment';
import { combineReducers } from 'redux';

import { getDayOfTheWeek } from '~/framework/util/date';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';

// Types

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

// State

interface IHomeworkAssistance_StateData {
  config?: IConfig;
  services: IService[];
}

export interface IHomeworkAssistance_State {
  config: AsyncState<IConfig>;
  services: AsyncState<IService[]>;
}

// Reducer

const initialState: IHomeworkAssistance_StateData = {
  services: [],
};

export const actionTypes = {
  config: createAsyncActionTypes(moduleConfig.namespaceActionType('CONFIG')),
  services: createAsyncActionTypes(moduleConfig.namespaceActionType('SERVICES')),
};

export default combineReducers({
  config: createSessionAsyncReducer(initialState.config, actionTypes.config),
  services: createSessionAsyncReducer(initialState.services, actionTypes.services),
});

// Getters

export const getIsDateValid = (config: IConfig, date: Moment, time: Moment): boolean => {
  const { openingDays, exclusions, openingTime } = config.settings;
  const weekday = getDayOfTheWeek(date);
  const allowedWeekDays = Object.keys(openingDays).filter(day => openingDays[day]);
  if (!allowedWeekDays.includes(weekday)) return false;
  for (const exclusion of exclusions) {
    if (date.isSameOrAfter(exclusion.start, 'day') && date.isSameOrBefore(exclusion.end, 'day')) return false;
  }
  if (!time.isBetween(openingTime.start, openingTime.end, undefined, '[]')) return false;
  return true;
};
