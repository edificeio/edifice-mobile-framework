import { CombinedState, combineReducers } from 'redux';

import flashMessages, { FlashMessagesState } from './flash-messages';
import notifDefinitions, { NotifDefinitionsState } from './notif-definitions';
import { NotificationFilter } from './notif-definitions/notif-filters';
import notifSettings, { NotifSettingsState } from './notif-settings';
import { IPushNotifsSettings } from './notif-settings/push-notifs-settings';
import notifications, { NotificationsState } from './notifications';

import { IGlobalState, Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/timeline/module-config';

// State

export type TimelineState = CombinedState<{
  notifDefinitions: NotifDefinitionsState;
  notifSettings: NotifSettingsState;
  notifications: NotificationsState;
  flashMessages: FlashMessagesState;
}>;

export interface INotificationFilterWithSetting extends NotificationFilter {
  setting: boolean;
}

export interface IPushNotifsSettingsByType {
  [type: string]: IPushNotifsSettings;
}

// Reducer

const reducer = combineReducers({
  flashMessages,
  notifDefinitions,
  notifications,
  notifSettings,
});

// Getters

export const getNotifFiltersWithSetting = (state: TimelineState) =>
  state.notifDefinitions.notifFilters.data.map(e => ({
    ...e,
    setting: state.notifSettings.notifFilterSettings.data[e.type],
  })) as INotificationFilterWithSetting[];

export const getPushNotifsSettingsByType = (state: TimelineState) => {
  return Object.keys(state.notifSettings.pushNotifsSettings.data).reduce((acc: IPushNotifsSettingsByType, key) => {
    const notifType = state.notifDefinitions.notifTypes.data.find(nt => nt.key === key);
    if (!notifType) return acc;
    if (!acc[notifType.type]) acc[notifType.type] = {};
    acc[notifType.type][key] = state.notifSettings.pushNotifsSettings.data[key];
    return acc;
  }, {});
};

export const getDefaultPushNotifsSettingsByType = (state: TimelineState) => {
  return Object.values(state.notifDefinitions.notifTypes.data).reduce((acc: IPushNotifsSettingsByType, nt) => {
    if (nt['push-notif']) {
      if (!acc[nt.type]) acc[nt.type] = {};
      acc[nt.type][nt.key] = nt['push-notif'];
    }
    return acc;
  }, {});
};

Reducers.register(moduleConfig.reducerName, reducer);

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as TimelineState;

export default reducer;
