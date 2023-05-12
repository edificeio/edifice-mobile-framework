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

export interface IPushNotifsSettings {
  [notifKey: string]: boolean;
}

export type IPushNotifsSettings_State_Data = IPushNotifsSettings;
export type IPushNotifsSettings_State = AsyncState<IPushNotifsSettings_State_Data>;

// Reducer

const initialState: IPushNotifsSettings = {};

export const actionTypes = {
  ...createAsyncActionTypes(moduleConfig.namespaceActionType('PUSHNOTIFS_SETTINGS')),
  put: moduleConfig.namespaceActionType('PUSHNOTIFS_SETTINGS_UPDATED'),
  setRequest: moduleConfig.namespaceActionType('PUSHNOTIFS_SETTINGS_SET_REQUEST'),
  setReceipt: moduleConfig.namespaceActionType('PUSHNOTIFS_SETTINGS_SET_RECEIPT'),
  setError: moduleConfig.namespaceActionType('PUSHNOTIFS_SETTINGS_SET_ERROR'),
};
export const actions = {
  ...createAsyncActionCreators<IPushNotifsSettings_State_Data>(actionTypes),
  put: (data: IPushNotifsSettings) => ({ type: actionTypes.put, data }),
  setRequest: (pushNotifsSettings: IPushNotifsSettings_State_Data) => ({ type: actionTypes.setRequest, pushNotifsSettings }),
  setReceipt: (pushNotifsSettings: IPushNotifsSettings_State_Data) => ({ type: actionTypes.setReceipt, pushNotifsSettings }),
  setError: (pushNotifsSettings: IPushNotifsSettings_State_Data) => ({ type: actionTypes.setError, pushNotifsSettings }),
};

const actionsHandlerMap: IReducerActionsHandlerMap<IPushNotifsSettings_State_Data> = {
  [actionTypes.put]: (s, a) => {
    const action = a as Action & { data: IPushNotifsSettings };
    return { ...s, ...action.data };
  },
  [actionTypes.setRequest]: s => s,
  [actionTypes.setReceipt]: (s, a) => {
    const action = a as Action & { pushNotifsSettings: IPushNotifsSettings_State_Data };
    return { ...s, ...action.pushNotifsSettings };
  },
  [actionTypes.setError]: s => s,
};

export default createSessionAsyncReducer(initialState, actionTypes, actionsHandlerMap);

// Getters
