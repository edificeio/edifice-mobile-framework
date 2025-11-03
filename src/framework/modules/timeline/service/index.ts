/**
 * Timeline services
 */
import deepmerge from 'deepmerge';
import queryString from 'query-string';

import { AuthActiveAccount, AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';
import { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import {
  IPushNotifsSettings,
  PushNotifsSettingsStateData,
} from '~/framework/modules/timeline/reducer/notif-settings/push-notifs-settings';
import { IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from '~/framework/util/notifications';
import { sessionFetch } from '~/framework/util/transport';

// Notifications

export const registeredNotificationsService = {
  list: async (session: AuthActiveAccount) => {
    const api = '/timeline/registeredNotifications';
    return sessionFetch.json<Promise<IEntcoreNotificationType[]>>(api);
  },
};

export const notifFiltersService = {
  list: async (session: AuthActiveAccount) => {
    const api = '/timeline/types';
    return sessionFetch.json<Promise<string[]>>(api);
  },
};

export const notificationsService = {
  page: async (session: AuthActiveAccount, page: number, filters: string[]) => {
    const url = '/timeline/lastNotifications';
    const query = {
      page,
      type: filters,
    };
    const api = queryString.stringifyUrl({ query, url });
    const headers = {
      Accept: 'application/json;version=3.0',
    };
    const entcoreNotifications = await sessionFetch.json<{
      results: IEntcoreTimelineNotification[];
      status: string;
      number: number;
    }>(api, { headers });

    if (entcoreNotifications.status !== 'ok') {
      throw new Error('[notificationsService.page] got status not ok from ' + api);
    }
    // Run the notification adapter for each received notification
    return entcoreNotifications.results.map(n => notificationAdapter(n) as ITimelineNotification);
  },
  report: async (session: AuthActiveAccount, id: string) => {
    const api = `/timeline/${id}/report`;
    const method = 'PUT';
    return sessionFetch.json(api, { method });
  },
};

// Flash Messages

export const flashMessagesService = {
  dismiss: async (session: AuthActiveAccount, flashMessageId: number) => {
    const api = `/timeline/flashmsg/${flashMessageId}/markasread`;
    return sessionFetch.json<any>(api, { method: 'PUT' });
  },
  list: async (session: AuthActiveAccount) => {
    const api = '/timeline/flashmsg/listuser';
    return sessionFetch.json<Promise<IEntcoreFlashMessage[]>>(api);
  },
};

// Push-notifs preferences

export interface IEntcoreTimelinePreference {
  preference: string;
}
export interface IEntcoreTimelinePreferenceContent {
  config:
    | {
        [notifKey: string]: {
          'defaultFrequency': string;
          'type'?: string;
          'event-type'?: string;
          'app-name'?: string;
          'app-address'?: string;
          'key'?: string;
          'push-notif'?: boolean;
          'restriction'?: string;
        };
      }
    | undefined;
  page: number;
  type: string[];
}

export const pushNotifsService = {
  _getConfig: async (session: AuthLoggedAccount) => {
    const prefs = await pushNotifsService._getPrefs(session);
    return prefs?.config ?? {};
  },
  _getPrefs: async (session: AuthActiveAccount) => {
    const api = '/userbook/preference/timeline';
    const response = await sessionFetch.json<IEntcoreTimelinePreference>(api);
    const prefs = JSON.parse(response.preference) as IEntcoreTimelinePreferenceContent | null;
    return prefs;
  },
  list: async (session: AuthLoggedAccount) => {
    const notifPrefs = {} as IPushNotifsSettings;
    const data = await pushNotifsService._getConfig(session);
    for (const k in data) {
      if (data[k]['push-notif'] !== undefined) {
        notifPrefs[k] = data[k]['push-notif']!;
      }
    }
    return notifPrefs;
  },
  set: async (session: AuthActiveAccount, changes: PushNotifsSettingsStateData) => {
    const api = '/userbook/preference/timeline';
    const method = 'PUT';
    const notifPrefsUpdated = {} as { 'push-notif': boolean };
    for (const k in changes) {
      notifPrefsUpdated[k] = { 'push-notif': changes[k] };
    }
    const prefsOriginal = await pushNotifsService._getPrefs(session);
    const notifPrefsOriginal = prefsOriginal?.config ?? {};
    const notifPrefs = deepmerge(notifPrefsOriginal, notifPrefsUpdated);
    const prefsUpdated = { config: notifPrefs };
    const payload = { ...prefsOriginal, ...prefsUpdated };
    const responseJson = await sessionFetch.json(api, {
      body: JSON.stringify(payload),
      method,
    });
    return responseJson;
  },
};
