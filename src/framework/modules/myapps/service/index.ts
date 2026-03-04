import {
  AppBookmarks,
  ApplicationsConfig,
  ApplicationsList,
  ApplicationsListResponse,
  AppsInfo,
} from '~/framework/modules/myapps/types';
import { sessionFetch } from '~/framework/util/transport';

const adaptApplicationList = (app: ApplicationsList): AppsInfo => ({ ...app, isFavorite: false, isMobile: false });

export const myAppsService = {
  bookmarks: async (): Promise<AppBookmarks> => {
    const json = await sessionFetch.json<{ preference?: string }>('/userbook/preference/apps', { method: 'GET' });

    if (!json?.preference) {
      return {
        applications: [],
        bookmarks: [],
      };
    }

    try {
      return JSON.parse(json.preference);
    } catch {
      return {
        applications: [],
        bookmarks: [],
      };
    }
  },
  config: async () => {
    const conf = await sessionFetch.json<ApplicationsConfig[]>('/myApps/config', { method: 'GET' });
    return conf;
  },
  list: async () => {
    const { apps } = await sessionFetch.json<ApplicationsListResponse>('/applications-list', { method: 'GET' });

    return apps.map(adaptApplicationList);
  },
  updateBookmarks: async (favorites: AppBookmarks) => {
    const api = '/userbook/preference/apps';
    await sessionFetch(api, { body: JSON.stringify(favorites), method: 'PUT' });
  },
};
