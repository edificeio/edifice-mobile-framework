/**
 * Timeline services
 */
import deepmerge from 'deepmerge';
import queryString from 'query-string';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';
import { IEntcoreNotificationType } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import {
  IPushNotifsSettings,
  PushNotifsSettingsStateData,
} from '~/framework/modules/timeline/reducer/notif-settings/push-notifs-settings';
import { IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from '~/framework/util/notifications';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';

// Notifications

export const registeredNotificationsService = {
  list: async (session: AuthLoggedAccount) => {
    const api = '/timeline/registeredNotifications';
    return fetchJSONWithCache(api) as Promise<IEntcoreNotificationType[]>;
  },
};

export const notifFiltersService = {
  list: async (session: AuthLoggedAccount) => {
    const api = '/timeline/types';
    return fetchJSONWithCache(api) as Promise<string[]>;
  },
};

export const notificationsService = {
  page: async (session: AuthLoggedAccount, page: number, filters: string[]) => {
    const url = '/timeline/lastNotifications';
    const query = {
      page,
      type: filters,
    };
    const api = queryString.stringifyUrl({ query, url });
    const headers = {
      Accept: 'application/json;version=3.0',
    };
    const entcoreNotifications = (await fetchJSONWithCache(api, { headers })) as {
      results: IEntcoreTimelineNotification[];
      status: string;
      number: number;
    };
    if (entcoreNotifications.status !== 'ok') {
      throw new Error('[notificationsService.page] got status not ok from ' + api);
    }
    // Run the notification adapter for each received notification
    return entcoreNotifications.results.map(n => notificationAdapter(n) as ITimelineNotification);
  },
  report: async (session: AuthLoggedAccount, id: string) => {
    const api = `${session.platform.url}/timeline/${id}/report`;
    const method = 'PUT';
    return signedFetchJson(api, { method });
  },
};

// Flash Messages

export const flashMessagesService = {
  dismiss: async (session: AuthLoggedAccount, flashMessageId: number) => {
    const api = `/timeline/flashmsg/${flashMessageId}/markasread`;
    return fetchJSONWithCache(api, { method: 'PUT' }) as any;
  },
  list: async (session: AuthLoggedAccount) => {
    const api = '/timeline/flashmsg/listuser';
    return fetchJSONWithCache(api) as Promise<IEntcoreFlashMessage[]>;
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
          defaultFrequency: string;
          type?: string;
          'event-type'?: string;
          'app-name'?: string;
          'app-address'?: string;
          key?: string;
          'push-notif'?: boolean;
          restriction?: string;
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
  _getPrefs: async (session: AuthLoggedAccount) => {
    const api = '/userbook/preference/timeline';
    const response = (await fetchJSONWithCache(api)) as IEntcoreTimelinePreference;
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
  set: async (session: AuthLoggedAccount, changes: PushNotifsSettingsStateData) => {
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
    const responseJson = await signedFetchJson(`${session.platform.url}${api}`, {
      body: JSON.stringify(payload),
      method,
    });
    return responseJson;
  },
};
