import React from 'react';

import { createFakeStorageLib } from '~/test-utils/fake-storage-lib';
import { act, renderHook } from '~/test-utils/render-hook';

import { AccountStorageProvider } from './account-context';
import { AccountStorageHandler } from './account-storage-handler';
import { useStorageBoolean, useStorageJSON, useStorageNumber, useStorageString } from './hooks';
import { StorageHandler } from './storage-handler';

interface Data {
  'a-flag': boolean;
  'a-count': number;
  'a-text': string;
  'an-object': { x: number };
  'other-count': number;
}

const setup = () => {
  const lib = createFakeStorageLib();
  const storage = new StorageHandler<Data>(lib).setPrefix('ns');
  const preferences = new AccountStorageHandler<Data>(lib).setPrefix('ns');
  return { lib, preferences, storage };
};

describe('hooks of a storage', () => {
  it('give undefined while nothing is stored, then the value', () => {
    const { storage } = setup();
    const { result } = renderHook(() => useStorageNumber(storage, 'a-count'));
    expect(result.current[0]).toBeUndefined();
    act(() => storage.set('a-count', 4));
    expect(result.current[0]).toBe(4);
  });

  it('render again when the value is changed from outside the component', () => {
    const { storage } = setup();
    const { result } = renderHook(() => useStorageString(storage, 'a-text'));
    act(() => storage.set('a-text', 'first'));
    expect(result.current[0]).toBe('first');
    act(() => storage.set('a-text', 'second'));
    expect(result.current[0]).toBe('second');
  });

  it('give a setter that writes the value, and that removes it with undefined', () => {
    const { storage } = setup();
    const { result } = renderHook(() => useStorageNumber(storage, 'a-count'));
    act(() => result.current[1](3));
    expect(storage.getNumber('a-count')).toBe(3);
    expect(result.current[0]).toBe(3);
    act(() => result.current[1](undefined));
    expect(storage.contains('a-count')).toBe(false);
    expect(result.current[0]).toBeUndefined();
  });

  it('do not render again for another key', () => {
    const { storage } = setup();
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useStorageNumber(storage, 'a-count');
    });
    const before = renders;
    act(() => storage.set('other-count', 1));
    expect(renders).toBe(before);
  });

  it('read booleans, false included', () => {
    const { storage } = setup();
    const { result } = renderHook(() => useStorageBoolean(storage, 'a-flag'));
    expect(result.current[0]).toBeUndefined();
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it('give the same object while a JSON value does not change, and a new one when it does', () => {
    const { storage } = setup();
    const { result } = renderHook(() => useStorageJSON(storage, 'an-object'));
    act(() => storage.setJSON('an-object', { x: 1 }));
    const first = result.current[0];
    expect(first).toEqual({ x: 1 });
    act(() => storage.set('other-count', 1));
    expect(result.current[0]).toBe(first);
    act(() => storage.setJSON('an-object', { x: 2 }));
    expect(result.current[0]).not.toBe(first);
    expect(result.current[0]).toEqual({ x: 2 });
  });

  it('give undefined, and do not throw, for a JSON value that is corrupted', () => {
    const { lib, storage } = setup();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    lib.set('ns.an-object', '{not json');
    const { result } = renderHook(() => useStorageJSON(storage, 'an-object'));
    expect(result.current[0]).toBeUndefined();
  });

  it('stop listening when the component is removed', () => {
    const { lib, storage } = setup();
    const { unmount } = renderHook(() => useStorageNumber(storage, 'a-count'));
    expect(lib.listenerCount()).toBe(1);
    unmount();
    expect(lib.listenerCount()).toBe(0);
  });

  it('share one listener of the lib between the components', () => {
    const { lib, storage } = setup();
    renderHook(() => useStorageNumber(storage, 'a-count'));
    renderHook(() => useStorageNumber(storage, 'a-count'));
    renderHook(() => useStorageString(storage, 'a-text'));
    expect(lib.listenerCount()).toBe(1);
  });
});

describe('hooks of an account storage', () => {
  let currentAccount: string | undefined;

  beforeEach(() => {
    currentAccount = undefined;
    AccountStorageHandler.setAccountResolver(() => currentAccount);
  });

  const withAccount = (accountId: string) =>
    function Wrapper({ children }: React.PropsWithChildren) {
      return <AccountStorageProvider accountId={accountId}>{children}</AccountStorageProvider>;
    };

  it('work on the account of the component (withSession), not on the current one', () => {
    const { lib, preferences } = setup();
    currentAccount = 'current';
    const { result } = renderHook(() => useStorageNumber(preferences, 'a-count'), { wrapper: withAccount('mine') });
    act(() => result.current[1](5));
    expect(lib.data.get('@mine.ns.a-count')).toBe(5);
    expect(lib.data.has('@current.ns.a-count')).toBe(false);
    expect(result.current[0]).toBe(5);
  });

  it('only render again for the changes of that account', () => {
    const { preferences } = setup();
    let renders = 0;
    renderHook(
      () => {
        renders += 1;
        return useStorageNumber(preferences, 'a-count');
      },
      { wrapper: withAccount('mine') },
    );
    const before = renders;
    act(() => preferences.for('someone-else').set('a-count', 1));
    expect(renders).toBe(before);
  });

  it('work on the current account when the component is not wrapped', () => {
    const { lib, preferences } = setup();
    currentAccount = 'current';
    const { result } = renderHook(() => useStorageNumber(preferences, 'a-count'));
    act(() => result.current[1](2));
    expect(lib.data.get('@current.ns.a-count')).toBe(2);
  });

  it('work on the account of a view, with no session at all', () => {
    const { lib, preferences } = setup();
    const view = preferences.for('viewed');
    const { result } = renderHook(() => useStorageNumber(view, 'a-count'));
    act(() => result.current[1](8));
    expect(lib.data.get('@viewed.ns.a-count')).toBe(8);
    expect(result.current[0]).toBe(8);
  });

  it('give undefined, and a setter that throws, when there is no account', () => {
    const { lib, preferences } = setup();
    const { result } = renderHook(() => useStorageNumber(preferences, 'a-count'));
    expect(result.current[0]).toBeUndefined();
    expect(() => result.current[1](1)).toThrow('without an account');
    expect(lib.data.size).toBe(0);
    expect(lib.listenerCount()).toBe(0);
  });
});
