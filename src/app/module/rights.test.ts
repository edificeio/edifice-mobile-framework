import type { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { isModuleAvailableForUser as isAvailableForUser } from './rights';

/**
 * The tested modules have fictitious names, not the ones of the modules of the app (`AllModulesNames`), which come and go with the
 * migration: the type of `isModuleAvailableForUser` is overridden here to take any name.
 */
type TestedModule = Omit<Parameters<typeof isAvailableForUser>[0], 'name'> & { name: string };
const isModuleAvailableForUser = isAvailableForUser as (module: TestedModule, session: AuthActiveAccount) => boolean;

const createSession = ({ apps = [], widgets = [] }: { apps?: string[]; widgets?: string[] } = {}): AuthActiveAccount => {
  const session = createActiveAccount();
  return {
    ...session,
    rights: {
      ...session.rights,
      apps: apps.map(name => ({ name }) as IEntcoreApp),
      widgets: widgets.map(name => ({ name }) as IEntcoreWidget),
    },
  };
};

describe('isModuleAvailableForUser', () => {
  it('is true for a module without rights (a CoreModule), whatever the session', () => {
    expect(isModuleAvailableForUser({ name: 'core' }, createSession())).toBe(true);
  });

  describe('matchEntcoreApp', () => {
    const module = { matchEntcoreApp: 'Blog', name: 'blog' };

    it('is true when the session has the app', () => {
      expect(isModuleAvailableForUser(module, createSession({ apps: ['Actualites', 'Blog'] }))).toBe(true);
    });

    it('is false when the session lacks the app', () => {
      expect(isModuleAvailableForUser(module, createSession({ apps: ['Actualites'] }))).toBe(false);
    });

    it('does not match a widget of the same name', () => {
      expect(isModuleAvailableForUser(module, createSession({ widgets: ['Blog'] }))).toBe(false);
    });
  });

  describe('matchEntcoreWidget', () => {
    const module = { matchEntcoreWidget: 'agenda-widget', name: 'agenda' };

    it('is true when the session has the widget', () => {
      expect(isModuleAvailableForUser(module, createSession({ widgets: ['agenda-widget'] }))).toBe(true);
    });

    it('is false when the session lacks the widget', () => {
      expect(isModuleAvailableForUser(module, createSession({ widgets: ['other-widget'] }))).toBe(false);
    });

    it('does not match an app of the same name', () => {
      expect(isModuleAvailableForUser(module, createSession({ apps: ['agenda-widget'] }))).toBe(false);
    });
  });

  describe('hasRight', () => {
    it('decides alone when nothing else is declared', () => {
      expect(isModuleAvailableForUser({ hasRight: () => true, name: 'a' }, createSession())).toBe(true);
      expect(isModuleAvailableForUser({ hasRight: () => false, name: 'a' }, createSession())).toBe(false);
    });

    it('is given the session', () => {
      const session = createSession();
      const hasRight = jest.fn(() => true);
      isModuleAvailableForUser({ hasRight, name: 'a' }, session);
      expect(hasRight).toHaveBeenCalledWith(session);
    });
  });

  describe('several conditions', () => {
    const module = { hasRight: () => true, matchEntcoreApp: 'Blog', matchEntcoreWidget: 'blog-widget', name: 'blog' };

    it('is true when all of them are met', () => {
      expect(isModuleAvailableForUser(module, createSession({ apps: ['Blog'], widgets: ['blog-widget'] }))).toBe(true);
    });

    it.each([
      ['the app is missing', { widgets: ['blog-widget'] }, module],
      ['the widget is missing', { apps: ['Blog'] }, module],
      ['hasRight is false', { apps: ['Blog'], widgets: ['blog-widget'] }, { ...module, hasRight: () => false }],
    ])('is false when %s', (_, rights, testedModule) => {
      expect(isModuleAvailableForUser(testedModule, createSession(rights))).toBe(false);
    });

    it('does not call hasRight when the app is missing', () => {
      const hasRight = jest.fn(() => true);
      isModuleAvailableForUser({ hasRight, matchEntcoreApp: 'Blog', name: 'blog' }, createSession());
      expect(hasRight).not.toHaveBeenCalled();
    });
  });
});
