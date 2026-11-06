import { AppModule } from '~/modules/myapps/model';

import { getAppOpeningStrategy, getConnectorUrl, isConnector } from './opening';

describe('isConnector', () => {
  const webApp = { address: '/blog', prefix: '/blog', target: '' };

  it('is not a connector for a page of the ENT', () => {
    expect(isConnector(webApp)).toBe(false);
  });

  it.each([
    ['opens in a new window', { target: '_blank' }],
    ['has an absolute address', { address: 'https://example.com/blog' }],
    ['has an absolute http address', { address: 'http://example.com/blog' }],
    ['has a route of a web app', { address: '/blog#/list' }],
    ['has no prefix', { prefix: '' }],
    ['has a null prefix', { prefix: null }],
  ])('is a connector when it %s', (_, overrides) => {
    expect(isConnector({ ...webApp, ...overrides })).toBe(true);
  });
});

describe('getConnectorUrl', () => {
  it('goes through /auth/redirect, without the spaces around the address', () => {
    expect(getConnectorUrl(' https://example.com/a?b=c ')).toBe('/auth/redirect?url=https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc');
  });
});

describe('getAppOpeningStrategy', () => {
  const app = { address: '/blog', isConnector: false };
  const connector = { address: 'https://example.com', isConnector: true };
  const withEntry: AppModule = { entry: 'blog/home', name: 'blog' };
  const withoutEntry: AppModule = { name: 'blog' };

  it('opens the module when it has an entry, whatever the address', () => {
    expect(getAppOpeningStrategy(app, withEntry)).toEqual({ kind: 'module', moduleName: 'blog' });
    expect(getAppOpeningStrategy(connector, withEntry)).toEqual({ kind: 'module', moduleName: 'blog' });
  });

  it('opens the address as a web app for a module without entry', () => {
    expect(getAppOpeningStrategy(app, withoutEntry)).toEqual({ kind: 'web', url: '/blog' });
  });

  it('opens a connector for a module without entry and a connector address', () => {
    expect(getAppOpeningStrategy(connector, withoutEntry)).toEqual({
      kind: 'connector',
      url: '/auth/redirect?url=https%3A%2F%2Fexample.com',
    });
  });

  it('opens a connector without module', () => {
    expect(getAppOpeningStrategy(app, undefined)).toEqual({ kind: 'connector', url: '/auth/redirect?url=%2Fblog' });
  });
});
