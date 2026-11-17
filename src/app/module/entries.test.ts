import { getUserMenuEntries as getEntries } from './entries';
import type { ConfigForUserMenuEntry, UserMenuSection } from './types';

/**
 * The tested modules have fictitious names, and their links are not the ones of the modules of the app (`UserMenuEntry`, `never`
 * while no module declares one): the type of `getUserMenuEntries` is overridden here to give any link.
 */
const getUserMenuEntries = getEntries as (
  modules: Parameters<typeof getEntries>[0],
  section: UserMenuSection,
) => (ConfigForUserMenuEntry<string> & { module: string })[];

const link = (route: string, overrides: Partial<ConfigForUserMenuEntry<string>> = {}): ConfigForUserMenuEntry<string> => ({
  icon: 'ui-notif',
  labelI18n: `${route}-label`,
  route,
  section: 'configuration',
  testID: `${route}-link`,
  ...overrides,
});

describe('getUserMenuEntries', () => {
  it('gives nothing when no module has links', () => {
    expect(getUserMenuEntries([{ entries: {}, name: 'a' }], 'configuration')).toEqual([]);
  });

  it('keeps the links of the section, with the name of their module', () => {
    const modules = [
      { entries: { userMenu: [link('a/one'), link('a/two', { section: 'others' })] }, name: 'a' },
      { entries: { userMenu: [link('b/one', { section: 'others' })] }, name: 'b' },
    ];
    expect(getUserMenuEntries(modules, 'others').map(({ module, route }) => [module, route])).toEqual([
      ['a', 'a/two'],
      ['b', 'b/one'],
    ]);
  });

  it('sorts by order, then the links without one in the order of the modules', () => {
    const modules = [
      { entries: { userMenu: [link('a/none'), link('a/ten', { order: 10 })] }, name: 'a' },
      { entries: { userMenu: [link('b/none'), link('b/one', { order: 1 }), link('b/ten', { order: 10 })] }, name: 'b' },
    ];
    expect(getUserMenuEntries(modules, 'configuration').map(entry => entry.route)).toEqual([
      'b/one',
      'a/ten',
      'b/ten',
      'a/none',
      'b/none',
    ]);
  });
});
