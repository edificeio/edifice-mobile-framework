import I18n from 'i18n-js';
import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/timeline/module-config';
import { TimelineState } from '~/framework/modules/timeline/reducer';
import * as notifDefinitionsStateHandler from '~/framework/modules/timeline/reducer/notifDefinitions';
import {
  INotifFilterSettings,
  actions as notifFilterSettingsActions,
} from '~/framework/modules/timeline/reducer/notifSettings/notifFilterSettings';
import {
  IPushNotifsSettings,
  actions as pushNotifsSettingsActions,
} from '~/framework/modules/timeline/reducer/notifSettings/pushNotifsSettings';
import { pushNotifsService } from '~/framework/modules/timeline/service';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { getItemJson, removeItemJson, setItemJson } from '~/framework/util/storage';

import { loadNotificationsDefinitionsAction } from './notifDefinitions';

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
    const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings.${userId}`;
    let settings: INotifFilterSettings | undefined = await getItemJson(asyncStorageKey);
    if (!settings) {
      // On first app launch, migrate old data (if exists) to new user-aware format
      const oldAsyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
      const settingsToMigrate: INotifFilterSettings | undefined = await getItemJson(oldAsyncStorageKey);
      if (settingsToMigrate) {
        await removeItemJson(oldAsyncStorageKey);
        settings = settingsToMigrate;
      } else settings = {};
    }
    const defaults = {};
    for (const v of state.notifDefinitions.notifFilters.data) {
      defaults[v.type] = v.type !== 'MESSAGERIE'; // ToDo remove specific check here in favor in declarative in conversation module.
    }
    settings = { ...defaults, ...settings };

    // 3 - Save loaded notif settings for persistency
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
      const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings.${userId}`;
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
          text: I18n.t('common.error.text'),
        }),
      );
    }
  };
