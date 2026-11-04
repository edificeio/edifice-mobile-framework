import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import type { AppsPreferences, EntApp } from '~/modules/myapps/model';

import reducer, { initialState, myAppsActions } from '.';

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

describe('myapps reducer', () => {
  it('stores the apps and the preferences loaded', () => {
    let state = reducer(initialState, myAppsActions.appsLoaded([app]));
    state = reducer(state, myAppsActions.preferencesLoaded(preferences));
    expect(state.apps).toEqual({ data: [app], status: 'loaded' });
    expect(state.preferences).toEqual({ data: preferences, status: 'loaded' });
  });

  it('keeps the data on an error', () => {
    let state = reducer(initialState, myAppsActions.appsLoaded([app]));
    state = reducer(state, myAppsActions.appsFailed());
    state = reducer(state, myAppsActions.preferencesFailed());
    expect(state.apps).toEqual({ data: [app], status: 'error' });
    expect(state.preferences).toEqual({ data: initialState.preferences.data, status: 'error' });
  });

  it('remembers that the onboarding was shown', () => {
    expect(reducer(initialState, myAppsActions.onboardingShown()).onboardingShown).toBe(true);
  });

  it('is emptied when the session ends', () => {
    let state = reducer(initialState, myAppsActions.appsLoaded([app]));
    state = reducer(state, myAppsActions.onboardingShown());
    expect(reducer(state, createEndSessionAction())).toEqual(initialState);
  });
});
