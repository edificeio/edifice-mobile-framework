import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AppBookmarks, ApplicationsConfig, ApplicationsList } from '~/framework/modules/myapps/types';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { signedFetch } from '~/infra/fetchWithCache';

const adaptApplication = (app: ApplicationsList): IEntcoreApp => ({
  address: app.address,
  casType: app.casType ?? undefined,
  display: app.display,
  displayName: app.displayName,
  icon: app.icon,
  isExternal: app.isExternal,
  name: app.name,
  prefix: app.prefix ?? undefined,
  target: app.target ?? undefined,
});

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

  list: async (session: AuthActiveAccount): Promise<IEntcoreApp[]> => {
    const res = await signedFetch(`${session.platform.url}/applications-list`);
    const json = await res.json();
    const apps: ApplicationsList[] = Array.isArray(json) ? json : (json.applications ?? json.apps ?? []);
    return apps.map(adaptApplication);
  },

  updateBookmarks: async (session: AuthActiveAccount, favorites: AppBookmarks): Promise<void> => {
    await signedFetch(`${session.platform.url}/userbook/preference/apps`, {
      body: JSON.stringify(favorites),
      method: 'PUT',
    });
  },
};
