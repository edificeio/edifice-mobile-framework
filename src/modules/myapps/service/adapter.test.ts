import type { Translate } from '~/modules/myapps/model';

import { fromPreferences, toEntApps, toPreferences } from './adapter';
import type { API } from './api';

const createResponse = (overrides: Partial<API.EntAppResponse> & Pick<API.EntAppResponse, 'name'>): API.EntAppResponse => ({
  address: `/${overrides.name.toLowerCase()}`,
  display: true,
  displayName: overrides.name.toLowerCase(),
  icon: `${overrides.name.toLowerCase()}-large`,
  prefix: `/${overrides.name.toLowerCase()}`,
  target: '',
  ...overrides,
});

const translations: Record<string, string> = { 'myapps-app-actualites': 'Actualités' };
const translate: Translate = key => translations[key] ?? key;

describe('toEntApps', () => {
  it('builds the apps with the rules of the model', () => {
    const [app] = toEntApps(
      [createResponse({ category: 'communication', color: 'orange', help: { en: null, fr: 'https://help' }, name: 'Actualites' })],
      translate,
    );
    expect(app).toEqual({
      address: '/actualites',
      category: 'communication',
      color: 'orange',
      display: true,
      helpUrls: { fr: 'https://help' },
      icon: 'actualites',
      isLibrary: false,
      label: 'Actualités',
      name: 'Actualites',
    });
  });

  it('keeps all the apps, listed or not, in the order of the server', () => {
    const apps = toEntApps(
      [createResponse({ name: 'Zed' }), createResponse({ display: false, name: 'Hidden' }), createResponse({ name: 'Blog' })],
      translate,
    );
    expect(apps.map(app => [app.name, app.display])).toEqual([
      ['Zed', true],
      ['Hidden', false],
      ['Blog', true],
    ]);
  });

  it('applies the overrides of Directory', () => {
    const [app] = toEntApps([createResponse({ color: 'red', name: 'Directory' })], translate);
    expect(app).toMatchObject({ color: 'green', icon: 'userbook' });
  });

  describe('libraries', () => {
    const libraryInfo = createResponse({
      category: 'pedagogy',
      color: 'purple',
      display: false,
      help: { fr: 'https://library-help' },
      name: 'library-info',
    });

    it('take the config of library-info, which is not an app', () => {
      const apps = toEntApps([libraryInfo, createResponse({ address: 'https://library.edifice.io/x', name: 'Lib' })], translate);
      expect(apps).toHaveLength(1);
      expect(apps[0]).toMatchObject({
        category: 'pedagogy',
        color: 'purple',
        helpUrls: { fr: 'https://library-help' },
        isLibrary: true,
        name: 'Lib',
      });
    });

    it('keep their own config when they have a category', () => {
      const [app] = toEntApps(
        [libraryInfo, createResponse({ address: 'https://library.edifice.io/x', category: 'communication', name: 'Lib' })],
        translate,
      );
      expect(app).toMatchObject({ category: 'communication', isLibrary: false });
    });

    it('are libraries without library-info', () => {
      const [app] = toEntApps([createResponse({ address: 'https://library.edifice.io/x', name: 'Lib' })], translate);
      expect(app).toMatchObject({ category: 'other', isLibrary: true });
    });
  });
});

describe('toPreferences', () => {
  it.each([undefined, null, '', 'not json', 'null'])('gives empty preferences for %p', preference => {
    expect(toPreferences(preference)).toEqual({ applications: [], favorites: [] });
  });

  it('reads the JSON, bookmarks as favorites', () => {
    expect(toPreferences('{"applications":["A"],"bookmarks":["B"]}')).toEqual({ applications: ['A'], favorites: ['B'] });
  });

  it('fills a missing list', () => {
    expect(toPreferences('{"bookmarks":["B"]}')).toEqual({ applications: [], favorites: ['B'] });
  });
});

describe('fromPreferences', () => {
  it('gives the favorites as bookmarks', () => {
    expect(fromPreferences({ applications: ['A'], favorites: ['B'] })).toEqual({ applications: ['A'], bookmarks: ['B'] });
  });
});
