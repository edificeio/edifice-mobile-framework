import { CombinedState, combineReducers } from 'redux';

import notifFilterSettings, { NotifFilterSettingsState } from './notifFilterSettings';
import pushNotifsSettings, { PushNotifsSettingsState } from './pushNotifsSettings';

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
