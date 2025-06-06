import { ThunkDispatch } from 'redux-thunk';

import { loadNotificationsDefinitionsAction } from './notif-definitions';

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
import { preferences } from '~/framework/modules/timeline/storage';
import { notifierShowAction } from '~/framework/util/notifier/actions';

export const loadNotificationFiltersSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    dispatch(notifFilterSettingsActions.request());
    // 1 - Load notification definitions if necessary
    let state = moduleConfig.getState(getState()) as TimelineState;
    if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
      await dispatch(loadNotificationsDefinitionsAction());
    }
    state = moduleConfig.getState(getState());

    let settings = preferences.getJSON('notif-filters');

    // 3 - merge with defaults
    const defaults = {};
    for (const v of state.notifDefinitions.notifFilters.data) {
      defaults[v.type] = v.type !== 'MESSAGERIE'; // ToDo remove specific check here in favor in declarative in conversation module.
    }
    settings = { ...defaults, ...settings };

    // 4 - Save loaded notif settings for persistency
    preferences.setJSON('notif-filters', settings);
    dispatch(notifFilterSettingsActions.receipt(settings));
  } catch (e) {
    // ToDo: Error handling
    dispatch(notifFilterSettingsActions.error(e as Error));
  }
};

export const setFiltersAction =
  (selectedFilters: INotifFilterSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      dispatch(notifFilterSettingsActions.setRequest(selectedFilters));
      preferences.setJSON('notif-filters', selectedFilters);
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
          id: 'timeline/push-notifications',
          text: I18n.get('timeline-notifsettings-error-text'),
          type: 'error',
        }),
      );
    }
  };
