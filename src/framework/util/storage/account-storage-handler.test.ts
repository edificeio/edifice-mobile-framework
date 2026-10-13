import { createFakeStorageLib } from '~/test-utils/fake-storage-lib';

import { AccountStorageHandler } from './account-storage-handler';

interface Data {
  'a-count': number;
  'a-text': string;
}

const setup = () => {
  const lib = createFakeStorageLib();
  const handler = new AccountStorageHandler<Data>(lib).setPrefix('ns');
  return { handler, lib };
};

describe('AccountStorageHandler', () => {
  let currentAccount: string | undefined;

  beforeEach(() => {
    currentAccount = undefined;
    AccountStorageHandler.setAccountResolver(() => currentAccount);
  });

  describe('the current account', () => {
    it('prefixes the keys with the id of the current account and the namespace', () => {
      const { handler, lib } = setup();
      currentAccount = 'acc1';
      handler.set('a-count', 3);
      expect(lib.data.get('@acc1.ns.a-count')).toBe(3);
    });

    it('follows the current account when it changes', () => {
      const { handler } = setup();
      currentAccount = 'acc1';
      handler.set('a-count', 1);
      currentAccount = 'acc2';
      expect(handler.getNumber('a-count')).toBeUndefined();
      handler.set('a-count', 2);
      currentAccount = 'acc1';
      expect(handler.getNumber('a-count')).toBe(1);
    });

    it('throws, whatever the access, when there is no account', () => {
      const { handler } = setup();
      expect(() => handler.getNumber('a-count')).toThrow('no account');
      expect(() => handler.set('a-count', 1)).toThrow('no account');
      expect(() => handler.contains('a-count')).toThrow('no account');
      expect(() => handler.remove('a-count')).toThrow('no account');
    });

    it('tells the current account, or none', () => {
      expect(AccountStorageHandler.peekAccountId()).toBeUndefined();
      expect(() => AccountStorageHandler.currentAccountId()).toThrow('no account');
      currentAccount = 'acc1';
      expect(AccountStorageHandler.peekAccountId()).toBe('acc1');
      expect(AccountStorageHandler.currentAccountId()).toBe('acc1');
    });
  });

  describe('for(accountId)', () => {
    it('works on the given account, whatever the current one is, even none', () => {
      const { handler, lib } = setup();
      handler.for('acc9').set('a-count', 9);
      expect(lib.data.get('@acc9.ns.a-count')).toBe(9);
      expect(handler.for('acc9').getNumber('a-count')).toBe(9);
    });

    it('is not affected by the changes of the current account', () => {
      const { handler } = setup();
      currentAccount = 'acc1';
      const view = handler.for('acc1');
      view.set('a-count', 1);
      currentAccount = 'acc2';
      expect(view.getNumber('a-count')).toBe(1);
      expect(handler.getNumber('a-count')).toBeUndefined();
    });

    it('is tied to its account, which the storage itself is not', () => {
      const { handler } = setup();
      expect(handler.boundAccountId).toBeUndefined();
      expect(handler.for('acc1').boundAccountId).toBe('acc1');
    });

    it('does not change the storage it is made from', () => {
      const { handler } = setup();
      handler.for('acc1');
      expect(handler.boundAccountId).toBeUndefined();
      expect(() => handler.getNumber('a-count')).toThrow('no account');
    });

    it('keeps the namespace of its storage', () => {
      const { handler, lib } = setup();
      handler.for('acc1').set('a-text', 'x');
      expect(lib.data.has('@acc1.ns.a-text')).toBe(true);
    });

    it('gives only the keys of its account', () => {
      const { handler } = setup();
      handler.for('acc1').set('a-count', 1);
      handler.for('acc1').set('a-text', 'x');
      handler.for('acc2').set('a-count', 2);
      expect(handler.for('acc1').getAllKeys().sort()).toEqual(['@acc1.ns.a-count', '@acc1.ns.a-text']);
      expect(handler.for('acc2').getAllKeys()).toEqual(['@acc2.ns.a-count']);
    });

    it('listens to the changes of its account only', () => {
      const { handler } = setup();
      const listener = jest.fn();
      handler.for('acc1').addOnChangedListener('a-count', listener);
      handler.for('acc2').set('a-count', 2);
      expect(listener).not.toHaveBeenCalled();
      handler.for('acc1').set('a-count', 1);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
