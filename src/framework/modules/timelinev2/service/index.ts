/**
 * Timeline services
 */
import deepmerge from 'deepmerge';
import queryString from 'query-string';

import { IEntcoreFlashMessage } from '~/framework/modules/timelinev2/reducer/flashMessages';
import { IEntcoreNotificationType } from '~/framework/modules/timelinev2/reducer/notifDefinitions/notifTypes';
import {
  IPushNotifsSettings,
  IPushNotifsSettings_State_Data,
} from '~/framework/modules/timelinev2/reducer/notifSettings/pushNotifsSettings';
import { IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from '~/framework/util/notifications';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';

import { ISession } from '../../auth/model';

// Notifications

export const registeredNotificationsService = {
  list: async (session: ISession) => {
    const api = '/timeline/registeredNotifications';
    return fetchJSONWithCache(api) as Promise<IEntcoreNotificationType[]>;
  },
};

export const notifFiltersService = {
  list: async (session: ISession) => {
    const api = '/timeline/types';
    return fetchJSONWithCache(api) as Promise<string[]>;
  },
};

export const notificationsService = {
  page: async (session: ISession, page: number, filters: string[]) => {
    const url = '/timeline/lastNotifications';
    const query = {
      page,
      type: filters,
    };
    const api = queryString.stringifyUrl({ url, query });
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
  report: async (session: ISession, id: string) => {
    const api = `${session.platform.url}/timeline/${id}/report`;
    const method = 'PUT';
    return signedFetchJson(api, { method });
  },
};

// Flash Messages

export const flashMessagesService = {
  list: async (session: ISession) => {
    const api = '/timeline/flashmsg/listuser';
    return fetchJSONWithCache(api) as Promise<IEntcoreFlashMessage[]>;
  },
  dismiss: async (session: ISession, flashMessageId: number) => {
    const api = `/timeline/flashmsg/${flashMessageId}/markasread`;
    return fetchJSONWithCache(api, { method: 'PUT' }) as any;
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
  _getPrefs: async (session: ISession) => {
    const api = '/userbook/preference/timeline';
    const response = (await fetchJSONWithCache(api)) as IEntcoreTimelinePreference;
    const prefs = JSON.parse(response.preference) as IEntcoreTimelinePreferenceContent | null;
    return prefs;
  },
  _getConfig: async (session: ISession) => {
    const prefs = await pushNotifsService._getPrefs(session);
    return prefs?.config ?? {};
  },
  list: async (session: ISession) => {
    const notifPrefs = {} as IPushNotifsSettings;
    const data = await pushNotifsService._getConfig(session);
    for (const k in data) {
      if (data[k].hasOwnProperty('push-notif') && data[k]['push-notif'] !== undefined) {
        notifPrefs[k] = data[k]['push-notif']!;
      }
    }
    return notifPrefs;
  },
  set: async (session: ISession, changes: IPushNotifsSettings_State_Data) => {
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
      method,
      body: JSON.stringify(payload),
    });
    return responseJson;
  },
};
