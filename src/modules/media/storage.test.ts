import type * as MigrationsModule from '~/framework/util/storage/migrations';
import type { FakeStorageLib } from '~/test-utils/fake-storage-lib';

import type * as StorageModule from './storage';

// Same fakes as `loadStorageModules`, loaded together with the storage of the module (it must be created by the same `Storage`)
jest.mock('~/framework/util/storage/mmkv');
jest.mock('~/framework/util/tracker', () => ({ Trackers: { trackDebugEvent: jest.fn() } }));

const setup = () => {
  let loaded!: { lib: FakeStorageLib; migrations: typeof MigrationsModule; storage: typeof StorageModule };
  jest.isolateModules(() => {
    loaded = {
      lib: require('~/framework/util/storage/mmkv').mmkvInstance,
      migrations: require('~/framework/util/storage/migrations'),
      storage: require('./storage'),
    };
  });
  loaded.lib.reset();
  return loaded;
};

describe('parseLegacyPrivacyAlertDate', () => {
  const { storage } = setup();

  it('reads the date that earlier versions wrote', () => {
    expect(storage.parseLegacyPrivacyAlertDate('"2026-10-29"')?.toString()).toBe('2026-10-29');
  });

  it('reads the instant that the former carousel wrote, as a day', () => {
    expect(storage.parseLegacyPrivacyAlertDate('"2026-10-29T12:00:00.000Z"')?.toString()).toBe('2026-10-29');
  });

  it.each([undefined, '', 'not json', '12', 'null', '"yesterday"'])('gives nothing for %p', raw => {
    expect(storage.parseLegacyPrivacyAlertDate(raw)).toBeUndefined();
  });
});

describe('the migration of the privacy alert date', () => {
  it('copies the former key to the one of the storage', async () => {
    const { lib, migrations, storage } = setup();
    lib.set(storage.LEGACY_PRIVACY_ALERT_KEY, '"2026-10-29"');
    await migrations.runDeviceStorageMigrations([storage.mediaStorage]);
    expect(storage.mediaStorage.getString('privacyAlertDate')).toBe('2026-10-29');
    expect(lib.data.get('media.privacyAlertDate')).toBe('2026-10-29');
  });

  it('leaves the former key, which earlier versions of the app still read', async () => {
    const { lib, migrations, storage } = setup();
    lib.set(storage.LEGACY_PRIVACY_ALERT_KEY, '"2026-10-29"');
    await migrations.runDeviceStorageMigrations([storage.mediaStorage]);
    expect(lib.data.get(storage.LEGACY_PRIVACY_ALERT_KEY)).toBe('"2026-10-29"');
  });

  it('writes nothing when there is no former key, or one that can not be read', async () => {
    const { lib, migrations, storage } = setup();
    lib.set(storage.LEGACY_PRIVACY_ALERT_KEY, 'garbage');
    await migrations.runDeviceStorageMigrations([storage.mediaStorage]);
    expect(storage.mediaStorage.getString('privacyAlertDate')).toBeUndefined();
  });
});
