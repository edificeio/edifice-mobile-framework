/**
 * Homework assistance Reducer
 */
import { Moment } from 'moment';
import { combineReducers } from 'redux';

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
      start: {
        hour: string;
        minute: string;
      };
      end: {
        hour: string;
        minute: string;
      };
    };
  };
}

// State

interface IHomeworkAssistance_StateData {
  config?: IConfig;
  services: string[];
}

export interface IHomeworkAssistance_State {
  config: AsyncState<IConfig>;
  services: AsyncState<string[]>;
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
