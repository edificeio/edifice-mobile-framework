/**
 * Timeline services
 */
import deepmerge from 'deepmerge';
import queryString from 'query-string';

import { IEntcoreFlashMessage } from '~/framework/modules/home/reducer/flash-messages';
import { IEntcoreNotificationType } from '~/framework/modules/home/reducer/notif-definitions/notif-types';
import {
  IPushNotifsSettings,
  PushNotifsSettingsStateData,
} from '~/framework/modules/home/reducer/notif-settings/push-notifs-settings';
import { IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from '~/framework/util/notifications';
import { sessionFetch } from '~/framework/util/transport';

// Notifications

export const registeredNotificationsService = {
  list: async () => {
    const api = '/timeline/registeredNotifications';
    return sessionFetch.json<IEntcoreNotificationType[]>(api);
  },
};

export const notifFiltersService = {
  list: async () => {
    const api = '/timeline/types';
    return sessionFetch.json<string[]>(api);
  },
};

// the timeline and the sent notifications share this endpoint and its payload, only the query and headers differ.
const fetchLastNotificationsPage = async (
  query: queryString.StringifiableRecord,
  headers?: Record<string, string>,
): Promise<ITimelineNotification[]> => {
  const api = queryString.stringifyUrl({ query, url: '/timeline/lastNotifications' });
  const entcoreNotifications = await sessionFetch.json<{
    results: IEntcoreTimelineNotification[];
    status: string;
  }>(api, { headers });

  if (entcoreNotifications.status !== 'ok') {
    throw new Error(`[notificationsService] got status not ok from ${api}`);
  }
  return entcoreNotifications.results.map(n => notificationAdapter(n) as ITimelineNotification);
};

const LAST_NOTIFICATIONS_API_VERSION_1D = '3.0';

export const notificationsService = {
  deleteForEveryone: async (id: string): Promise<void> => {
    const api = `/timeline/${id}`;
    await sessionFetch.json(api, { method: 'DELETE' });
  },

  // hides a notification for the user only.
  deleteForSelf: async (id: string) => {
    const api = `/timeline/${id}`;
    return sessionFetch.json(api, { method: 'PUT' });
  },

  // `_` keeps a cached page from being served.
  getSentNotificationsPage: (page: number, filters: readonly string[]): Promise<ITimelineNotification[]> =>
    fetchLastNotificationsPage({ _: Date.now(), mine: 1, page, type: filters }),

  page: (
    page: number,
    filters: string[],
    apiVersion: string = LAST_NOTIFICATIONS_API_VERSION_1D,
  ): Promise<ITimelineNotification[]> =>
    fetchLastNotificationsPage({ page, type: filters }, { Accept: `application/json;version=${apiVersion}` }),

  report: async (id: string) => {
    const api = `/timeline/${id}/report`;
    const method = 'PUT';
    return sessionFetch.json(api, { method });
  },
};

// Flash Messages

export const flashMessagesService = {
  dismiss: async (flashMessageId: number) => {
    const api = `/timeline/flashmsg/${flashMessageId}/markasread`;
    return sessionFetch.json<any>(api, { method: 'PUT' });
  },
  list: async () => {
    const api = '/timeline/flashmsg/listuser';
    return sessionFetch.json<IEntcoreFlashMessage[]>(api);
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
  _getConfig: async () => {
    const prefs = await pushNotifsService._getPrefs();
    return prefs?.config ?? {};
  },
  _getPrefs: async () => {
    const api = '/userbook/preference/timeline';
    const response = await sessionFetch.json<IEntcoreTimelinePreference>(api);
    const prefs = JSON.parse(response.preference) as IEntcoreTimelinePreferenceContent | null;
    return prefs;
  },
  list: async () => {
    const notifPrefs = {} as IPushNotifsSettings;
    const data = await pushNotifsService._getConfig();
    for (const k in data) {
      if (data[k]['push-notif'] !== undefined) {
        notifPrefs[k] = data[k]['push-notif']!;
      }
    }
    return notifPrefs;
  },
  set: async (changes: PushNotifsSettingsStateData) => {
    const api = '/userbook/preference/timeline';
    const method = 'PUT';
    const notifPrefsUpdated = {} as { 'push-notif': boolean };
    for (const k in changes) {
      notifPrefsUpdated[k] = { 'push-notif': changes[k] };
    }
    const prefsOriginal = await pushNotifsService._getPrefs();
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
