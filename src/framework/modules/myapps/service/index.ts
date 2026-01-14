import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AppBookmarks, ApplicationsConfig, ApplicationsList, AppsInfo } from '~/framework/modules/myapps/types';
import { signedFetch } from '~/infra/fetchWithCache';

const adaptApplicationList = (app: ApplicationsList): AppsInfo => ({ ...app, isFavorite: false, isMobile: false });

export const myAppsService = {
  bookmarks: async (session: AuthActiveAccount): Promise<AppBookmarks> => {
    const res = await signedFetch(`${session.platform.url}/userbook/preference/apps`);
    const json = await res.json();

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

  config: async (session: AuthActiveAccount): Promise<ApplicationsConfig[]> => {
    const res = await signedFetch(`${session.platform.url}/myApps/config`);
    const resp = await res.json();
    return resp;
  },

  list: async (session: AuthActiveAccount): Promise<AppsInfo[]> => {
    const res = await signedFetch(`${session.platform.url}/applications-list`);
    const json = await res.json();
    const apps: ApplicationsList[] = Array.isArray(json) ? json : (json.applications ?? json.apps ?? []);
    return apps.map(adaptApplicationList);
  },
};
