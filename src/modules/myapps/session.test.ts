import type { AppsPreferences, EntApp } from '~/modules/myapps/model';
import { myAppsService } from '~/modules/myapps/service';
import { myAppsActions } from '~/modules/myapps/store';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { createMyAppsSessionHooks } from './session';

// The service signs its requests with the session: replaced here (it needs the native side)
jest.mock('~/modules/myapps/service', () => ({
  myAppsService: { apps: jest.fn(), preferences: { get: jest.fn(), put: jest.fn() } },
}));
const service = jest.mocked(myAppsService);

const app: EntApp = {
  address: '/blog',
  category: 'other',
  display: true,
  helpUrls: {},
  icon: 'blog',
  isLibrary: false,
  label: 'Blog',
  name: 'Blog',
};
const preferences: AppsPreferences = { applications: [], favorites: ['Blog'] };
const session = createActiveAccount({ id: 'session' });

describe('myapps session hooks', () => {
  const dispatch = jest.fn();
  const hooks = createMyAppsSessionHooks({ dispatch });

  beforeEach(() => {
    dispatch.mockReset();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('sessionSetup', () => {
    it('loads the apps with the account, and writes them only on commit', async () => {
      service.apps.mockResolvedValue([app]);
      const { signal } = new AbortController();
      const result = await hooks.sessionSetup(session, { signal });
      expect(service.apps).toHaveBeenCalledWith(session, { signal });
      expect(dispatch).not.toHaveBeenCalled();
      (result as { commit: () => void }).commit();
      expect(dispatch).toHaveBeenCalledWith(myAppsActions.appsLoaded([app]));
    });

    it('fails when the apps cannot be loaded (the sign-in fails)', async () => {
      service.apps.mockRejectedValue(new Error('down'));
      await expect(hooks.sessionSetup(session, { signal: new AbortController().signal })).rejects.toThrow('down');
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('onSessionStart', () => {
    it('loads the preferences', async () => {
      service.preferences.get.mockResolvedValue(preferences);
      await hooks.onSessionStart(session, { signal: new AbortController().signal });
      expect(dispatch).toHaveBeenCalledWith(myAppsActions.preferencesLoaded(preferences));
    });

    it('sets an error when they cannot be loaded', async () => {
      service.preferences.get.mockRejectedValue(new Error('down'));
      await hooks.onSessionStart(session, { signal: new AbortController().signal });
      expect(dispatch).toHaveBeenCalledWith(myAppsActions.preferencesFailed());
    });

    it('writes nothing once the session has ended', async () => {
      const controller = new AbortController();
      service.preferences.get.mockImplementation(async () => {
        controller.abort();
        return preferences;
      });
      await hooks.onSessionStart(session, { signal: controller.signal });
      service.preferences.get.mockImplementation(async () => {
        throw new Error('aborted');
      });
      await hooks.onSessionStart(session, { signal: controller.signal });
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
