import type { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { isModuleAvailable } from './rights';

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

describe('isModuleAvailable', () => {
  it('is true for a module without rights (a CoreModule), whatever the session', () => {
    expect(isModuleAvailable({ name: 'core' }, createSession())).toBe(true);
  });

  describe('matchEntcoreApp', () => {
    const module = { matchEntcoreApp: 'Blog', name: 'blog' };

    it('is true when the session has the app', () => {
      expect(isModuleAvailable(module, createSession({ apps: ['Actualites', 'Blog'] }))).toBe(true);
    });

    it('is false when the session lacks the app', () => {
      expect(isModuleAvailable(module, createSession({ apps: ['Actualites'] }))).toBe(false);
    });

    it('does not match a widget of the same name', () => {
      expect(isModuleAvailable(module, createSession({ widgets: ['Blog'] }))).toBe(false);
    });
  });

  describe('matchEntcoreWidget', () => {
    const module = { matchEntcoreWidget: 'agenda-widget', name: 'agenda' };

    it('is true when the session has the widget', () => {
      expect(isModuleAvailable(module, createSession({ widgets: ['agenda-widget'] }))).toBe(true);
    });

    it('is false when the session lacks the widget', () => {
      expect(isModuleAvailable(module, createSession({ widgets: ['other-widget'] }))).toBe(false);
    });

    it('does not match an app of the same name', () => {
      expect(isModuleAvailable(module, createSession({ apps: ['agenda-widget'] }))).toBe(false);
    });
  });

  describe('hasRight', () => {
    it('decides alone when nothing else is declared', () => {
      expect(isModuleAvailable({ hasRight: () => true, name: 'a' }, createSession())).toBe(true);
      expect(isModuleAvailable({ hasRight: () => false, name: 'a' }, createSession())).toBe(false);
    });

    it('is given the session', () => {
      const session = createSession();
      const hasRight = jest.fn(() => true);
      isModuleAvailable({ hasRight, name: 'a' }, session);
      expect(hasRight).toHaveBeenCalledWith(session);
    });
  });

  describe('several conditions', () => {
    const module = { hasRight: () => true, matchEntcoreApp: 'Blog', matchEntcoreWidget: 'blog-widget', name: 'blog' };

    it('is true when all of them are met', () => {
      expect(isModuleAvailable(module, createSession({ apps: ['Blog'], widgets: ['blog-widget'] }))).toBe(true);
    });

    it.each([
      ['the app is missing', { widgets: ['blog-widget'] }, module],
      ['the widget is missing', { apps: ['Blog'] }, module],
      ['hasRight is false', { apps: ['Blog'], widgets: ['blog-widget'] }, { ...module, hasRight: () => false }],
    ])('is false when %s', (_, rights, testedModule) => {
      expect(isModuleAvailable(testedModule, createSession(rights))).toBe(false);
    });

    it('does not call hasRight when the app is missing', () => {
      const hasRight = jest.fn(() => true);
      isModuleAvailable({ hasRight, matchEntcoreApp: 'Blog', name: 'blog' }, createSession());
      expect(hasRight).not.toHaveBeenCalled();
    });
  });
});
