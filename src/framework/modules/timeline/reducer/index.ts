import { CombinedState, combineReducers } from 'redux';

import { IGlobalState, Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/timeline/moduleConfig';

import flashMessages, { IFlashMessages_State } from './flashMessages';
import notifDefinitions, { INotifDefinitions_State } from './notifDefinitions';
import { INotificationFilter } from './notifDefinitions/notifFilters';
import notifSettings, { INotifSettings_State } from './notifSettings';
import { IPushNotifsSettings } from './notifSettings/pushNotifsSettings';
import notifications, { INotifications_State } from './notifications';

// State

export type ITimeline_State = CombinedState<{
  notifDefinitions: INotifDefinitions_State;
  notifSettings: INotifSettings_State;
  notifications: INotifications_State;
  flashMessages: IFlashMessages_State;
}>;

export interface INotificationFilterWithSetting extends INotificationFilter {
  setting: boolean;
}

export interface IPushNotifsSettingsByType {
  [type: string]: IPushNotifsSettings;
}

// Reducer

const reducer = combineReducers({
  notifDefinitions,
  notifSettings,
  notifications,
  flashMessages,
});

// Getters

export const getNotifFiltersWithSetting = (state: ITimeline_State) =>
  state.notifDefinitions.notifFilters.data.map(e => ({
    ...e,
    setting: state.notifSettings.notifFilterSettings.data[e.type],
  })) as INotificationFilterWithSetting[];

export const getPushNotifsSettingsByType = (state: ITimeline_State) => {
  return Object.keys(state.notifSettings.pushNotifsSettings.data).reduce((acc: IPushNotifsSettingsByType, key) => {
    const nt = state.notifDefinitions.notifTypes.data.find(nt => nt.key === key);
    if (!nt) return acc;
    if (!acc[nt.type]) acc[nt.type] = {};
    acc[nt.type][key] = state.notifSettings.pushNotifsSettings.data[key];
    return acc;
  }, {});
};

export const getDefaultPushNotifsSettingsByType = (state: ITimeline_State) => {
  return Object.values(state.notifDefinitions.notifTypes.data).reduce((acc: IPushNotifsSettingsByType, nt) => {
    if (nt['push-notif']) {
      if (!acc[nt.type]) acc[nt.type] = {};
      acc[nt.type][nt.key] = nt['push-notif'];
    }
    return acc;
  }, {});
};

Reducers.register(moduleConfig.reducerName, reducer);

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as ITimeline_State;

export default reducer;
