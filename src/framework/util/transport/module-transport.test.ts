/**
 * `getModuleTransport` is about types: what it accepts is checked by `tsc` (`@ts-expect-error` below), what it gives by Jest.
 */
import type { BaseApiClient } from '@edifice.io/community-client-rest-rn';

import type { ModuleTransport } from './module-transport';

jest.mock('./api', () => ({ accountApi: jest.fn(), sessionApi: jest.fn() }));
jest.mock('./fetch', () => ({ accountFetch: jest.fn(), sessionFetch: jest.fn(), tokenFetch: jest.fn() }));

const { accountApi, sessionApi } = jest.requireMock('./api');
const { accountFetch, sessionFetch, tokenFetch } = jest.requireMock('./fetch');
const { getModuleTransport } = require('./module-transport') as typeof import('./module-transport');

describe('getModuleTransport', () => {
  it('gives the functions of the transport, unchanged', () => {
    expect(getModuleTransport('myapps')).toEqual({ accountApi, accountFetch, sessionApi, sessionFetch, tokenFetch });
    expect(getModuleTransport('myapps').accountFetch).toBe(accountFetch);
  });
});

// # Types: never called, only compiled

declare const transport: ModuleTransport<'timeline' | 'userbook'>;
declare const account: Parameters<ModuleTransport<never>['accountApi']>[0];
declare const id: string;
declare const Client: new () => BaseApiClient;

export function pathsUnderTheScopes() {
  transport.sessionFetch('/timeline');
  transport.sessionFetch('/timeline/lastNotifications');
  transport.sessionFetch('/timeline?page=1');
  transport.accountFetch.json<string[]>(account, `/userbook/user/${id}`, { method: 'GET' });
  const path = '/userbook/preference/apps';
  transport.sessionFetch.text(path);
  transport.accountApi(account, { apiName: 'timeline' }, Client);
  transport.sessionApi({ apiName: 'userbook/api' }, Client);
}

export function pathsOutOfTheScopes() {
  // @ts-expect-error not a scope of the module
  transport.sessionFetch('/workspace/document');
  // @ts-expect-error a scope is a whole segment
  transport.sessionFetch('/timelines/list');
  // @ts-expect-error relative to the platform only
  transport.sessionFetch('https://ent.example.com/timeline');
  // @ts-expect-error a `string` can't be checked
  transport.accountFetch(account, `/timeline/${id}` as string);
  // @ts-expect-error not a scope of the module
  transport.sessionApi({ apiName: 'collect/api' }, Client);
}

export function moduleWithoutScope(none: ModuleTransport<never>) {
  // @ts-expect-error no scope: no path
  none.sessionFetch('/timeline');
}
