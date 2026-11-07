import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';

import { useAccountsStore } from '~/modules/auth/store/accounts';
import type { AppsPreferences, EntApp } from '~/modules/myapps/model';
import { myAppsService } from '~/modules/myapps/service';
import reducer, { myAppsActions } from '~/modules/myapps/store';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { refreshMyApps, saveFavorites, toggleFavorite } from './actions';

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
const translate = (key: string) => key;

describe('myapps actions', () => {
  const session = createActiveAccount({ id: 'session' });
  let store: ReturnType<typeof createTestStore>;
  const createTestStore = () => legacy_createStore(combineReducers({ myapps: reducer }), applyMiddleware(thunk));
  const myapps = () => store.getState().myapps;

  beforeEach(() => {
    store = createTestStore();
    useAccountsStore.setState(useAccountsStore.getInitialState(), true);
    useAccountsStore.getState().setAccount(session);
  });

  describe('refreshMyApps', () => {
    it('loads the apps and the preferences with the session', async () => {
      service.apps.mockResolvedValue([app]);
      service.preferences.get.mockResolvedValue(preferences);
      await expect(store.dispatch(refreshMyApps({ translate }))).resolves.toBe(true);
      expect(service.apps).toHaveBeenCalledWith(session, { translate });
      expect(myapps().apps).toEqual({ data: [app], status: 'loaded' });
      expect(myapps().preferences).toEqual({ data: preferences, status: 'loaded' });
    });

    it('sets an error on what fails, and keeps the rest', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      service.apps.mockResolvedValue([app]);
      service.preferences.get.mockRejectedValue(new Error('down'));
      await expect(store.dispatch(refreshMyApps({ translate }))).resolves.toBe(false);
      expect(myapps().apps.status).toBe('loaded');
      expect(myapps().preferences.status).toBe('error');
    });
  });

  describe('favorites', () => {
    it('are stored only once saved', async () => {
      store.dispatch(myAppsActions.preferencesLoaded({ applications: [], favorites: ['A'] }));
      let resolvePut = () => {};
      service.preferences.put.mockReturnValue(new Promise<void>(resolve => (resolvePut = resolve)));
      const saving = store.dispatch(toggleFavorite('B'));
      await Promise.resolve();
      expect(myapps().preferences.data.favorites).toEqual(['A']);
      resolvePut();
      await saving;
      expect(service.preferences.put).toHaveBeenCalledWith(session, { applications: [], favorites: ['A', 'B'] });
      expect(myapps().preferences.data.favorites).toEqual(['A', 'B']);
    });

    it('do not change when they cannot be saved', async () => {
      store.dispatch(myAppsActions.preferencesLoaded({ applications: [], favorites: ['A'] }));
      service.preferences.put.mockRejectedValue(new Error('down'));
      await expect(store.dispatch(saveFavorites(['C']))).rejects.toThrow('down');
      expect(myapps().preferences.data.favorites).toEqual(['A']);
    });

    it('are read from the server first when the state does not have them', async () => {
      service.preferences.get.mockResolvedValue({ applications: ['A', 'B'], favorites: ['A'] });
      service.preferences.put.mockResolvedValue();
      await store.dispatch(toggleFavorite('B'));
      expect(service.preferences.put).toHaveBeenCalledWith(session, { applications: ['A', 'B'], favorites: ['A', 'B'] });
      expect(myapps().preferences).toEqual({ data: { applications: ['A', 'B'], favorites: ['A', 'B'] }, status: 'loaded' });
    });
  });
});
