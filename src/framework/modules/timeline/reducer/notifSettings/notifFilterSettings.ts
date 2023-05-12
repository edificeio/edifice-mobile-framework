import { Action } from 'redux';

import moduleConfig from '~/framework/modules/timeline/moduleConfig';
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

export type INotifFilterSettings_State_Data = INotifFilterSettings;
export type INotifFilterSettings_State = AsyncState<INotifFilterSettings_State_Data>;

// Reducer

const initialState: INotifFilterSettings = {};

export const actionTypes = {
  ...createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_SETTINGS')),
  put: moduleConfig.namespaceActionType('NOTIFICATION_SETTINGS_UPDATED'),
  setRequest: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_REQUEST'),
  setReceipt: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_RECEIPT'),
  setError: moduleConfig.namespaceActionType('NOTIFICATION_FILTERS_SET_ERROR'),
};
export const actions = {
  ...createAsyncActionCreators<INotifFilterSettings_State_Data>(actionTypes),
  put: (data: INotifFilterSettings) => ({ type: actionTypes.put, data }),
  setRequest: (selectedFilters: INotifFilterSettings_State_Data) => ({ type: actionTypes.setRequest, selectedFilters }),
  setReceipt: (selectedFilters: INotifFilterSettings_State_Data) => ({ type: actionTypes.setReceipt, selectedFilters }),
  setError: (selectedFilters: INotifFilterSettings_State_Data) => ({ type: actionTypes.setError, selectedFilters }),
};

const actionsHandlerMap: IReducerActionsHandlerMap<INotifFilterSettings_State_Data> = {
  [actionTypes.put]: (s, a) => {
    const action = a as Action & { data: INotifFilterSettings };
    return { ...s, ...action.data };
  },
  [actionTypes.setRequest]: s => s,
  [actionTypes.setReceipt]: (s, a) => {
    const action = a as Action & { selectedFilters: INotifFilterSettings_State_Data };
    return { ...s, ...action.selectedFilters };
  },
  [actionTypes.setError]: s => s,
};

export default createSessionAsyncReducer(initialState, actionTypes, actionsHandlerMap);

// Getters
