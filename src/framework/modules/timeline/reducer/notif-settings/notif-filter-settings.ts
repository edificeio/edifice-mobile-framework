import { Action } from 'redux';

import moduleConfig from '~/framework/modules/timeline/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';
import { IReducerActionsHandlerMap } from '~/framework/util/redux/reducerFactory';

// State

export interface INotifFilterSettings {
  [type: string]: boolean;
}

export type NotifFilterSettingsStateData = INotifFilterSettings;
export type NotifFilterSettingsState = AsyncState<NotifFilterSettingsStateData>;

// Reducer

const initialState: INotifFilterSettings = {};

export const actionTypes = {
  ...createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_SETTINGS')),
  put: moduleConfig.namespaceActionType('NOTIFICATION_SETTINGS_UPDATED'),
  setError: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_ERROR'),
  setReceipt: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_RECEIPT'),
  setRequest: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_REQUEST'),
};
export const actions = {
  ...createAsyncActionCreators<NotifFilterSettingsStateData>(actionTypes),
  put: (data: INotifFilterSettings) => ({ data, type: actionTypes.put }),
  setError: (selectedFilters: NotifFilterSettingsStateData) => ({ selectedFilters, type: actionTypes.setError }),
  setReceipt: (selectedFilters: NotifFilterSettingsStateData) => ({ selectedFilters, type: actionTypes.setReceipt }),
  setRequest: (selectedFilters: NotifFilterSettingsStateData) => ({ selectedFilters, type: actionTypes.setRequest }),
};

const actionsHandlerMap: IReducerActionsHandlerMap<NotifFilterSettingsStateData> = {
  [actionTypes.put]: (s, a) => {
    const action = a as Action & { data: INotifFilterSettings };
    return { ...s, ...action.data };
  },
  [actionTypes.setRequest]: s => s,
  [actionTypes.setReceipt]: (s, a) => {
    const action = a as Action & { selectedFilters: NotifFilterSettingsStateData };
    return { ...s, ...action.selectedFilters };
  },
  [actionTypes.setError]: s => s,
};

export default createSessionAsyncReducer(initialState, actionTypes, actionsHandlerMap);

// Getters
