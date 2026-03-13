import { AuthTokenSet } from '~/framework/modules/auth/model';
import {
  AppBookmarks,
  ApplicationsConfig,
  ApplicationsList,
  ApplicationsListResponse,
  AppsInfo,
} from '~/framework/modules/myapps/types';
import { sessionFetch, tokenFetch } from '~/framework/util/transport';

interface IMyAppsFetch {
  json<T>(path: string, options?: any): Promise<T>;
}

const adaptApplicationList = (app: ApplicationsList): AppsInfo => ({
  ...app,
  isConnector: false,
  isFavorite: false,
  isMobile: false,
});

const createMyAppsServiceCore = (fetch: IMyAppsFetch) => ({
  bookmarks: async (): Promise<AppBookmarks> => {
    const json = await fetch.json<{ preference?: string }>('/userbook/preference/apps', { method: 'GET' });

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
    const conf = await fetch.json<ApplicationsConfig[]>('/myApps/config', { method: 'GET' });
    return conf;
  },
  list: async () => {
    const { apps } = await fetch.json<ApplicationsListResponse>('/applications-list', { method: 'GET' });

    return apps.map(adaptApplicationList);
  },
});

export const myAppsService = {
  ...createMyAppsServiceCore(sessionFetch),
  updateBookmarks: async (favorites: AppBookmarks) => {
    const api = '/userbook/preference/apps';
    await sessionFetch(api, { body: JSON.stringify(favorites), method: 'PUT' });
  },
};

export const createMyAppsServiceWithTokenFetch = (tokens: Pick<AuthTokenSet, 'access' | 'origin'>) =>
  createMyAppsServiceCore({
    json: <T>(path: string, options?: any) => tokenFetch.json<T>(tokens, path, options),
  });
