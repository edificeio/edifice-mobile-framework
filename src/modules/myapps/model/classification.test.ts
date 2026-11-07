import { AppConfig, EntApp, MyAppsFilter } from '~/modules/myapps/model';

import { filterApps, getAppCategory, getAppConfig, hasAppsToList, isLibrary, isOtherService, toListedApps } from './classification';

describe('getAppCategory', () => {
  it.each(['communication', 'pedagogy', 'organisation'])('keeps %s', category => {
    expect(getAppCategory(category)).toBe(category);
  });

  it.each([undefined, '', 'pedagogie', 'other'])('gives `other` for %p', category => {
    expect(getAppCategory(category)).toBe('other');
  });
});

describe('isLibrary', () => {
  it('is an app of library.edifice.io without category', () => {
    expect(isLibrary({ address: 'https://library.edifice.io/x' })).toBe(true);
    expect(isLibrary({ address: 'https://library.edifice.io/x', category: 'pedagogy' })).toBe(false);
    expect(isLibrary({ address: '/blog' })).toBe(false);
  });
});

describe('getAppConfig', () => {
  const libraryConfig: AppConfig = { category: 'pedagogy', color: 'purple', helpUrls: { fr: 'https://library-help' } };
  const own = { color: 'red', helpUrls: {} };

  it('is that of library-info for a library', () => {
    expect(getAppConfig({ ...own, address: 'https://library.edifice.io/x' }, libraryConfig)).toEqual(libraryConfig);
  });

  it('is its own for a library without library-info', () => {
    expect(getAppConfig({ ...own, address: 'https://library.edifice.io/x' }, undefined)).toEqual({ ...own, category: undefined });
  });

  it('is its own for another app', () => {
    expect(getAppConfig({ ...own, address: 'https://library.edifice.io/x', category: 'communication' }, libraryConfig)).toEqual({
      ...own,
      category: 'communication',
    });
    expect(getAppConfig({ ...own, address: '/blog' }, libraryConfig)).toEqual({ ...own, category: undefined });
  });
});

describe('isOtherService', () => {
  it('is an app without module and without known category', () => {
    expect(isOtherService({ category: 'other' }, false)).toBe(true);
    expect(isOtherService({ category: 'pedagogy' }, false)).toBe(false);
    expect(isOtherService({ category: 'other' }, true)).toBe(false);
  });
});

const app = (name: string, fields: Partial<EntApp> = {}): EntApp => ({
  address: `/${name.toLowerCase()}`,
  category: 'other',
  display: true,
  helpUrls: {},
  icon: name,
  isLibrary: false,
  label: name,
  name,
  ...fields,
});

describe('filterApps', () => {
  // Labels sorted as listed here
  const moduleApp = app('A-Module', { category: 'communication' });
  const webApp = app('B-Web', { category: 'pedagogy' });
  const favoriteWebApp = app('C-FavWeb', { category: 'communication' });
  const library = app('D-Library', { isLibrary: true });
  const otherService = app('E-Other');
  const favoriteOtherService = app('F-FavOther');
  const hidden = app('G-Hidden', { display: false });
  const apps = [favoriteOtherService, hidden, otherService, library, favoriteWebApp, webApp, moduleApp];

  const withModule = new Set([moduleApp.name, library.name]);
  // In the order of the preferences: not the order of the labels
  const favorites = [favoriteOtherService.name, hidden.name, favoriteWebApp.name];
  const names = (filter: MyAppsFilter, showAllApps: boolean, list: EntApp[] = apps) =>
    filterApps(toListedApps(list, { favorites, hasModule: name => withModule.has(name) }), filter, { favorites, showAllApps }).map(
      item => item.app.name,
    );

  it('all: the listed apps sorted by label, other services at the end', () => {
    expect(names({ type: 'all' }, true)).toEqual(['A-Module', 'B-Web', 'C-FavWeb', 'D-Library', 'E-Other', 'F-FavOther']);
  });

  it('all, showAllApps off: the modules, and the other services', () => {
    expect(names({ type: 'all' }, false)).toEqual(['A-Module', 'D-Library', 'E-Other', 'F-FavOther']);
  });

  it('never lists an app that is not displayed, even a favorite', () => {
    expect(names({ type: 'favorites' }, true)).not.toContain('G-Hidden');
    expect(names({ type: 'search', value: 'hidden' }, true)).toEqual([]);
  });

  it('favorites: all of them, whatever showAllApps, in the order of the preferences', () => {
    expect(names({ type: 'favorites' }, false)).toEqual(['F-FavOther', 'C-FavWeb']);
    expect(names({ type: 'favorites' }, true)).toEqual(['F-FavOther', 'C-FavWeb']);
  });

  it('category: the apps of the category', () => {
    expect(names({ type: 'category', value: 'communication' }, true)).toEqual(['A-Module', 'C-FavWeb']);
    expect(names({ type: 'category', value: 'communication' }, false)).toEqual(['A-Module']);
  });

  it('other services: the apps without module and without known category, whatever showAllApps', () => {
    expect(names({ type: 'other-services' }, true)).toEqual(['E-Other', 'F-FavOther']);
    expect(names({ type: 'other-services' }, false)).toEqual(['E-Other', 'F-FavOther']);
  });

  it('an app of category `other` with a module is not another service', () => {
    expect(names({ type: 'other-services' }, true)).not.toContain('D-Library');
  });

  it('libraries: the libraries', () => {
    expect(names({ type: 'libraries' }, true)).toEqual(['D-Library']);
  });

  describe('search', () => {
    it('matches the label, without case nor accents', () => {
      expect(names({ type: 'search', value: 'EDIT' }, true, [app('Éditeur', { category: 'pedagogy' }), app('Autre')])).toEqual([
        'Éditeur',
      ]);
    });

    it('with an empty query, is like all (favorites included when showAllApps is off)', () => {
      expect(names({ type: 'search', value: '  ' }, true)).toEqual([
        'A-Module',
        'B-Web',
        'C-FavWeb',
        'D-Library',
        'E-Other',
        'F-FavOther',
      ]);
      expect(names({ type: 'search', value: '' }, false)).toEqual(['A-Module', 'C-FavWeb', 'D-Library', 'E-Other', 'F-FavOther']);
    });

    it('adds only the matching other services', () => {
      expect(names({ type: 'search', value: 'fav' }, false)).toEqual(['C-FavWeb', 'F-FavOther']);
    });
  });
});

describe('toListedApps', () => {
  it('keeps the listed apps, sorted by label, with what the filters and the cards need', () => {
    const items = toListedApps([app('B', { category: 'pedagogy' }), app('Hidden', { display: false }), app('A')], {
      favorites: ['A'],
      hasModule: name => name === 'B',
    });
    expect(items).toEqual([
      { app: app('A'), hasModule: false, isFavorite: true, isOtherService: true },
      { app: app('B', { category: 'pedagogy' }), hasModule: true, isFavorite: false, isOtherService: false },
    ]);
  });
});

describe('hasAppsToList', () => {
  const items = (...names: string[]) =>
    toListedApps(
      names.map(name => app(name)),
      { favorites: [], hasModule: name => name === 'Module' },
    );

  it('is true with a listed app, when all the apps are shown', () => {
    expect(hasAppsToList(items('Web'), true)).toBe(true);
  });

  it('needs an app with a module when only the modules are shown', () => {
    expect(hasAppsToList(items('Web'), false)).toBe(false);
    expect(hasAppsToList(items('Web', 'Module'), false)).toBe(true);
  });

  it('is false without listed apps', () => {
    expect(hasAppsToList(toListedApps([app('Module', { display: false })], { favorites: [], hasModule: () => true }), true)).toBe(
      false,
    );
  });
});
