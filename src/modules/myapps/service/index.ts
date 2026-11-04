/**
 * API of « Mes applis ». It gives types of the model (see `adapter.ts`).
 * Every call is signed with the account given (`accountFetch`): the session, or the account being signed in (`sessionSetup`).
 */
import { accountFetch, getModuleTransport } from '~/framework/util/transport';
import type { AppsPreferences, EntApp } from '~/modules/myapps/model';
import { I18n } from '~/util/i18n';

import { fromPreferences, toEntApps, toPreferences } from './adapter';
import type { API } from './api';

type Account = Parameters<typeof accountFetch>[0];

interface RequestOptions {
  signal?: AbortSignal;
}

// Typed with the scopes of the module (`getModuleTransport`), except `/api/me/applications`: `portal` doesn't prefix its path
const transport = getModuleTransport('myapps');

const PREFERENCES_PATH = '/userbook/preference/apps';

export const myAppsService = {
  /** All the apps of the user, listed or not. Their labels are in the language of the request (`Accept-Language`). */
  apps: async (account: Account, { signal }: RequestOptions = {}): Promise<EntApp[]> => {
    const responses = await accountFetch.json<API.EntAppResponse[]>(account, '/api/me/applications', {
      signal,
    });
    return toEntApps(responses);
  },

  preferences: {
    /** The preferences of the user about the apps: empty if there are none, or if they can't be read. */
    get: async (account: Account, { signal }: RequestOptions = {}): Promise<AppsPreferences> => {
      const response = await transport.accountFetch.json<API.PreferencesResponse | null>(account, PREFERENCES_PATH, { signal });
      return toPreferences(response?.preference);
    },

    /** Replaces the preferences of the user about the apps. */
    put: async (account: Account, preferences: AppsPreferences) => {
      await transport.accountFetch(account, PREFERENCES_PATH, {
        body: JSON.stringify(fromPreferences(preferences)),
        method: 'PUT',
      });
    },
  },
};
