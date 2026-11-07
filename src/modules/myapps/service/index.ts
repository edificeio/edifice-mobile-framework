/**
 * API of « Mes applis ». It gives types of the model (see `adapter.ts`).
 * Every call is signed with the account given (`accountFetch`): the session, or the account being signed in (`sessionSetup`).
 */
import { accountFetch } from '~/framework/util/transport';
import type { AppsPreferences, EntApp, Translate } from '~/modules/myapps/model';

import { fromPreferences, toEntApps, toPreferences } from './adapter';
import type { API } from './api';

type Account = Parameters<typeof accountFetch>[0];

interface RequestOptions {
  signal?: AbortSignal;
}

const PREFERENCES_PATH = '/userbook/preference/apps';

export const myAppsService = {
  /**
   * All the apps of the user, listed or not.
   * @param translate translates the labels (`I18n.get`): they are in the language of the moment.
   */
  apps: async (account: Account, { signal, translate }: RequestOptions & { translate: Translate }): Promise<EntApp[]> => {
    const responses = await accountFetch.json<API.EntAppResponse[]>(account, '/api/me/applications', { signal });
    return toEntApps(responses, translate);
  },

  preferences: {
    /** The preferences of the user about the apps: empty if there are none, or if they can't be read. */
    get: async (account: Account, { signal }: RequestOptions = {}): Promise<AppsPreferences> => {
      const response = await accountFetch.json<API.PreferencesResponse | null>(account, PREFERENCES_PATH, { signal });
      return toPreferences(response?.preference);
    },

    /** Replaces the preferences of the user about the apps. */
    put: async (account: Account, preferences: AppsPreferences) => {
      await accountFetch(account, PREFERENCES_PATH, { body: JSON.stringify(fromPreferences(preferences)), method: 'PUT' });
    },
  },
};
