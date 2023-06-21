import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { assertSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/timeline/module-config';
import { TimelineState } from '~/framework/modules/timeline/reducer';
import * as notifDefinitionsStateHandler from '~/framework/modules/timeline/reducer/notif-definitions';
import {
  INotifFilterSettings,
  actions as notifFilterSettingsActions,
} from '~/framework/modules/timeline/reducer/notif-settings/notif-filter-settings';
import {
  IPushNotifsSettings,
  actions as pushNotifsSettingsActions,
} from '~/framework/modules/timeline/reducer/notif-settings/push-notifs-settings';
import { pushNotifsService } from '~/framework/modules/timeline/service';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { getItemJson, migrateItemJson, setItemJson } from '~/framework/util/storage';

import { loadNotificationsDefinitionsAction } from './notif-definitions';

const getAsyncStorageKey = (userId: string) => `${moduleConfig.name}.notifFilterSettings.${userId}`;

export const loadNotificationFiltersSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    dispatch(notifFilterSettingsActions.request());
    const session = assertSession();
    const userId = session.user.id;
    // 1 - Load notification definitions if necessary
    let state = moduleConfig.getState(getState()) as TimelineState;
    if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
      await dispatch(loadNotificationsDefinitionsAction());
    }
    state = moduleConfig.getState(getState());

    // 2 - Load notif settings from Async Storage
    const asyncStorageKey = getAsyncStorageKey(userId);
    let settings: INotifFilterSettings | undefined = await getItemJson(asyncStorageKey);

    // 2 bis - No existing data ? Maybe we have old data to migrate
    if (!settings) {
      settings = await migrateItemJson(`timelinev2.notifFilterSettings`, asyncStorageKey);
    }
    if (!settings) {
      settings = await migrateItemJson(`timelinev2.notifFilterSettings.${userId}`, asyncStorageKey);
    }

    // 3 - merge with defaults
    const defaults = {};
    for (const v of state.notifDefinitions.notifFilters.data) {
      defaults[v.type] = v.type !== 'MESSAGERIE'; // ToDo remove specific check here in favor in declarative in conversation module.
    }
    settings = { ...defaults, ...settings };

    // 4 - Save loaded notif settings for persistency
    await setItemJson(asyncStorageKey, settings);
    dispatch(notifFilterSettingsActions.receipt(settings));
  } catch (e) {
    // ToDo: Error handling
    dispatch(notifFilterSettingsActions.error(e as Error));
  }
};

export const setFiltersAction =
  (selectedFilters: INotifFilterSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      const userId = session.user.id;
      const asyncStorageKey = getAsyncStorageKey(userId);
      dispatch(notifFilterSettingsActions.setRequest(selectedFilters));
      await setItemJson(asyncStorageKey, selectedFilters);
      dispatch(notifFilterSettingsActions.setReceipt(selectedFilters));
    } catch {
      // ToDo: Error handling
      dispatch(notifFilterSettingsActions.setError(selectedFilters));
    }
  };

export const loadPushNotifsSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    dispatch(pushNotifsSettingsActions.request());
    const session = assertSession();
    // 1 - Load notification definitions if necessary
    let state = moduleConfig.getState(getState()) as TimelineState;
    if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
      await dispatch(loadNotificationsDefinitionsAction());
    }
    state = moduleConfig.getState(getState());

    // 2 - Load notif settings from API
    const pushNotifsSettings = await pushNotifsService.list(session);
    dispatch(pushNotifsSettingsActions.receipt(pushNotifsSettings));
  } catch (e) {
    // ToDo: Error handling
    dispatch(pushNotifsSettingsActions.error(e as Error));
  }
};

export const updatePushNotifsSettingsAction =
  (changes: IPushNotifsSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      dispatch(pushNotifsSettingsActions.setRequest(changes));
      const session = assertSession();
      await pushNotifsService.set(session, changes);
      dispatch(pushNotifsSettingsActions.setReceipt(changes));
      dispatch(loadPushNotifsSettingsAction()); // no await here it's for refreshing datas
    } catch (e) {
      // ToDo: Error handling
      dispatch(pushNotifsSettingsActions.setError(e as INotifFilterSettings));
      dispatch(
        notifierShowAction({
          type: 'error',
          id: 'timeline/push-notifications',
          text: I18n.get('common-error-text'),
        }),
      );
    }
  };
