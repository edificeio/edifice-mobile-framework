import { CombinedState, combineReducers } from 'redux';

import notifFilterSettings, { NotifFilterSettingsState } from './notif-filter-settings';
import pushNotifsSettings, { PushNotifsSettingsState } from './push-notifs-settings';

// State

export type NotifSettingsState = CombinedState<{
  notifFilterSettings: NotifFilterSettingsState;
  pushNotifsSettings: PushNotifsSettingsState;
}>;

// Reducer

export default combineReducers({
  notifFilterSettings,
  pushNotifsSettings,
});

// Getters

export const getAreNotificationFilterSettingsLoaded = (state: NotifSettingsState) => state.notifFilterSettings.lastSuccess;
