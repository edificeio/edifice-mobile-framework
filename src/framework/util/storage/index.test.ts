import { loadStorageModules } from '~/test-utils/storage-modules';

describe('Storage', () => {
  const setup = () => {
    const modules = loadStorageModules();
    const { AccountStorageHandler, Storage } = modules;
    const { lib } = modules;
    lib.reset();
    AccountStorageHandler.setAccountResolver(() => 'acc1');
    return { ...modules, Storage };
  };

  it('Storage.device prefixes the keys with the namespace', () => {
    const { lib, Storage } = setup();
    const storage = Storage.device<{ 'a-count': number }>({ namespace: 'device-ns' });
    storage.set('a-count', 1);
    expect(lib.data.get('device-ns.a-count')).toBe(1);
  });

  it('Storage.account prefixes the keys with the account and the namespace', () => {
    const { lib, Storage } = setup();
    const storage = Storage.account<{ 'a-count': number }>({ namespace: 'account-ns' });
    storage.set('a-count', 1);
    expect(lib.data.get('@acc1.account-ns.a-count')).toBe(1);
  });

  it('Storage.global reads and writes the keys as they are', () => {
    const { lib, Storage } = setup();
    lib.set('old.key', 'old');
    expect(Storage.global.getString('old.key')).toBe('old');
  });

  describe('eraseForAccount', () => {
    it('erases what the account storages hold for the account, including the markers of its migrations', () => {
      const { lib, Storage } = setup();
      lib.set('@acc12.ns.a-count', 1);
      lib.set('@acc12.$migration.ns.m1', 1);
      Storage.eraseForAccount('acc12');
      expect([...lib.data.keys()]).toEqual([]);
    });

    it('does not erase what belongs to another account, even if its id starts with the same characters', () => {
      const { lib, Storage } = setup();
      lib.set('@12.ns.a-count', 1);
      lib.set('@123.ns.a-count', 2);
      lib.set('@2.ns.a-count', 3);
      Storage.eraseForAccount('12');
      expect([...lib.data.keys()].sort()).toEqual(['@123.ns.a-count', '@2.ns.a-count']);
    });

    it('does not erase what belongs to the device', () => {
      const { lib, Storage } = setup();
      lib.set('device-ns.a-count', 1);
      lib.set('@12.ns.a-count', 1);
      Storage.eraseForAccount('12');
      expect([...lib.data.keys()]).toEqual(['device-ns.a-count']);
    });
  });
});
