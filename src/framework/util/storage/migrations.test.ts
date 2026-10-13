import { loadStorageModules } from '~/test-utils/storage-modules';

interface Data {
  'a-count': number;
}

const setup = () => {
  const modules = loadStorageModules();
  modules.lib.reset();
  modules.AccountStorageHandler.setAccountResolver(() => undefined);
  return modules;
};

/** Starts the app again on the same device: everything stored stays, everything in memory is new. */
const restart = (previous: ReturnType<typeof setup>) => {
  const stored = new Map(previous.lib.data);
  const next = setup();
  stored.forEach((value, key) => next.lib.set(key, value));
  return next;
};

describe('device migrations', () => {
  it('run once at the startup, and leave a marker', async () => {
    const { lib, migrations, Storage } = setup();
    const run = jest.fn();
    const storage = Storage.device<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await migrations.runDeviceStorageMigrations([storage]);
    expect(run).toHaveBeenCalledTimes(1);
    expect(lib.data.get('$migration.ns.m1')).toBe(1);
    await migrations.runDeviceStorageMigrations([storage]);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('do not run again when the app starts again', async () => {
    const first = setup();
    const run = jest.fn();
    const declare = (modules: ReturnType<typeof setup>) =>
      modules.Storage.device<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await first.migrations.runDeviceStorageMigrations([declare(first)]);
    const second = restart(first);
    await second.migrations.runDeviceStorageMigrations([declare(second)]);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('can write in the storage they work on (the one they are declared on)', async () => {
    const { lib, migrations, Storage } = setup();
    lib.set('old-key', '5');
    const storage = Storage.device<Data>({
      migrations: [
        {
          id: 'move-old-key',
          run: handler => {
            handler.set('a-count', Number(Storage.global.getString('old-key')));
            Storage.global.remove('old-key');
          },
        },
      ],
      namespace: 'ns',
    });
    await migrations.runDeviceStorageMigrations([storage]);
    expect(storage.getNumber('a-count')).toBe(5);
    expect(lib.data.has('old-key')).toBe(false);
    expect(lib.data.get('$migration.ns.move-old-key')).toBe(1);
  });

  it('run in the order they are declared, and in the order of the storages', async () => {
    const { migrations, Storage } = setup();
    const order: string[] = [];
    const first = Storage.device<Data>({
      migrations: [
        {
          id: 'a',
          run: () => {
            order.push('first.a');
          },
        },
        {
          id: 'b',
          run: () => {
            order.push('first.b');
          },
        },
      ],
      namespace: 'first',
    });
    const second = Storage.device<Data>({
      migrations: [
        {
          id: 'a',
          run: () => {
            order.push('second.a');
          },
        },
      ],
      namespace: 'second',
    });
    await migrations.runDeviceStorageMigrations([first, second]);
    expect(order).toEqual(['first.a', 'first.b', 'second.a']);
  });

  it('do not run the migrations of the accounts', async () => {
    const { migrations, Storage } = setup();
    const run = jest.fn();
    const preferences = Storage.account<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await migrations.runDeviceStorageMigrations([preferences]);
    expect(run).not.toHaveBeenCalled();
  });

  it('that fail leave no marker, are logged, and are tried again next time, without breaking the storage', async () => {
    const first = setup();
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    let fails = true;
    const declare = (modules: ReturnType<typeof setup>) =>
      modules.Storage.device<Data>({
        migrations: [
          {
            id: 'm1',
            run: () => {
              if (fails) throw new Error('boom');
            },
          },
        ],
        namespace: 'ns',
      });
    const storage = declare(first);
    await first.migrations.runDeviceStorageMigrations([storage]);
    expect(error).toHaveBeenCalled();
    expect(first.lib.data.has('$migration.ns.m1')).toBe(false);
    expect(() => storage.set('a-count', 1)).not.toThrow();

    fails = false;
    const second = restart(first);
    await second.migrations.runDeviceStorageMigrations([declare(second)]);
    expect(second.lib.data.get('$migration.ns.m1')).toBe(1);
  });

  it('run only once for a storage that several modules declare', async () => {
    const { migrations, Storage } = setup();
    const run = jest.fn();
    const storage = Storage.device<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await expect(migrations.runDeviceStorageMigrations([storage, storage])).resolves.toBeUndefined();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('refuse two different storages that have the same migration in the same namespace', async () => {
    const { migrations, Storage } = setup();
    const first = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    const second = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    await expect(migrations.runDeviceStorageMigrations([first, second])).rejects.toThrow('same id');
  });
});

describe('the declaration of the storages', () => {
  it('is required to use a storage that has migrations', async () => {
    const { migrations, Storage } = setup();
    const storage = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    expect(() => storage.getNumber('a-count')).toThrow('no module declares it');
    expect(() => storage.set('a-count', 1)).toThrow('no module declares it');
    await migrations.runDeviceStorageMigrations([]);
    expect(() => storage.getNumber('a-count')).toThrow('no module declares it');
  });

  it('lets use a storage that has migrations once a module declares it', async () => {
    const { migrations, Storage } = setup();
    const storage = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    await migrations.runDeviceStorageMigrations([storage]);
    expect(() => storage.set('a-count', 1)).not.toThrow();
    expect(storage.getNumber('a-count')).toBe(1);
  });

  it('is not required for a storage that has no migration', () => {
    const { Storage } = setup();
    const storage = Storage.device<Data>({ namespace: 'ns' });
    expect(() => storage.set('a-count', 1)).not.toThrow();
  });

  it('is required for the account storages too, and also covers their views', async () => {
    const { migrations, Storage } = setup();
    const preferences = Storage.account<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    expect(() => preferences.for('acc1').getNumber('a-count')).toThrow('no module declares it');
    await migrations.runDeviceStorageMigrations([preferences]);
    expect(() => preferences.for('acc1').getNumber('a-count')).not.toThrow();
  });

  it('is shared by the storages that have the same namespace (a storage created again by Fast Refresh)', async () => {
    const { migrations, Storage } = setup();
    const first = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    await migrations.runDeviceStorageMigrations([first]);
    const recreated = Storage.device<Data>({ migrations: [{ id: 'm1', run: jest.fn() }], namespace: 'ns' });
    expect(() => recreated.getNumber('a-count')).not.toThrow();
  });
});

describe('account migrations', () => {
  const declareAccountStorage = async (modules: ReturnType<typeof setup>, run: jest.Mock) => {
    const preferences = modules.Storage.account<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await modules.migrations.runDeviceStorageMigrations([preferences]);
    return preferences;
  };

  it('run for the account given, with the storage tied to it, and leave a marker among its data', async () => {
    const modules = setup();
    const run = jest.fn((preferences, { accountId }) => preferences.set('a-count', accountId === 'acc1' ? 1 : 2));
    await declareAccountStorage(modules, run);
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toEqual({ accountId: 'acc1' });
    expect(modules.lib.data.get('@acc1.ns.a-count')).toBe(1);
    expect(modules.lib.data.get('@acc1.$migration.ns.m1')).toBe(1);
  });

  it('work whatever the current account is, even none', async () => {
    const modules = setup();
    const run = jest.fn(preferences => preferences.set('a-count', 7));
    await declareAccountStorage(modules, run);
    modules.AccountStorageHandler.setAccountResolver(() => 'another');
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(modules.lib.data.get('@acc1.ns.a-count')).toBe(7);
    expect(modules.lib.data.has('@another.ns.a-count')).toBe(false);
  });

  it('run once for each account', async () => {
    const modules = setup();
    const run = jest.fn();
    await declareAccountStorage(modules, run);
    await modules.migrations.runAccountStorageMigrations('acc1');
    await modules.migrations.runAccountStorageMigrations('acc1');
    await modules.migrations.runAccountStorageMigrations('acc2');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('are tried again for an account when they failed', async () => {
    const modules = setup();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const run = jest.fn().mockImplementationOnce(() => {
      throw new Error('boom');
    });
    await declareAccountStorage(modules, run);
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(modules.lib.data.has('@acc1.$migration.ns.m1')).toBe(false);
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(run).toHaveBeenCalledTimes(2);
    expect(modules.lib.data.get('@acc1.$migration.ns.m1')).toBe(1);
  });

  it('run again for an account that was erased and comes back', async () => {
    const modules = setup();
    const run = jest.fn();
    await declareAccountStorage(modules, run);
    await modules.migrations.runAccountStorageMigrations('acc1');
    modules.Storage.eraseForAccount('acc1');
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('do nothing for the storages no module declares', async () => {
    const modules = setup();
    const run = jest.fn();
    modules.Storage.account<Data>({ migrations: [{ id: 'm1', run }], namespace: 'ns' });
    await modules.migrations.runDeviceStorageMigrations([]);
    await modules.migrations.runAccountStorageMigrations('acc1');
    expect(run).not.toHaveBeenCalled();
  });
});
