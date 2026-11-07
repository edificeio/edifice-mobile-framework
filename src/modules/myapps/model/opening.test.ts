import type { AllModulesNames } from '~/app/module';

import { getAppModules, getAppUrl } from './opening';

describe('getAppUrl', () => {
  const platformUrl = 'https://ent.example.com';

  it('keeps an address of the platform as it is', () => {
    expect(getAppUrl('/actualites', platformUrl)).toBe('/actualites');
    expect(getAppUrl(' https://ent.example.com/blog#/list ', platformUrl)).toBe('https://ent.example.com/blog#/list');
  });

  it('goes through /auth/redirect for another domain', () => {
    expect(getAppUrl(' https://example.com/a?b=c ', platformUrl)).toBe('/auth/redirect?url=https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc');
    expect(getAppUrl('https://sub.ent.example.com/x', platformUrl)).toBe(
      '/auth/redirect?url=https%3A%2F%2Fsub.ent.example.com%2Fx',
    );
  });

  it('goes through /auth/redirect for an address it cannot read', () => {
    expect(getAppUrl('not an url', platformUrl)).toBe('/auth/redirect?url=not%20an%20url');
  });
});

describe('getAppModules', () => {
  // Fictitious modules: the names of the modules of the app come and go with the migration
  const getModules = getAppModules as (
    modules: readonly { name: string; matchEntcoreApp?: string }[],
  ) => ReadonlyMap<string, AllModulesNames | string>;

  it('gives the module of each app, by `matchEntcoreApp`', () => {
    const modules = getModules([
      { matchEntcoreApp: 'Blog', name: 'blog' },
      { matchEntcoreApp: 'Wiki', name: 'wiki' },
      { name: 'core' },
    ]);
    expect([...modules]).toEqual([
      ['Blog', 'blog'],
      ['Wiki', 'wiki'],
    ]);
  });
});
