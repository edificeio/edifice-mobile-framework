import { CombinedState, combineReducers } from 'redux';

import { IGlobalState, Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/timeline/module-config';

import flashMessages, { FlashMessagesState } from './flashMessages';
import notifDefinitions, { NotifDefinitionsState } from './notifDefinitions';
import { NotificationFilter } from './notifDefinitions/notifFilters';
import notifSettings, { NotifSettingsState } from './notifSettings';
import { IPushNotifsSettings } from './notifSettings/pushNotifsSettings';
import notifications, { NotificationsState } from './notifications';

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
  notifDefinitions,
  notifSettings,
  notifications,
  flashMessages,
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
