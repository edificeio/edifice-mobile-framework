import { Alert } from 'react-native';

import type * as MigrationsModule from '~/framework/util/storage/migrations';

import type * as PrivacyAlertModule from './privacy-alert';
import type * as StorageModule from './storage';

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));
jest.mock('~/util/i18n', () => ({ I18n: { get: (key: string) => key } }));
jest.mock('~/framework/util/storage/mmkv');
jest.mock('~/framework/util/tracker', () => ({ Trackers: { trackDebugEvent: jest.fn() } }));

const setup = async (today: string) => {
  jest.useFakeTimers().setSystemTime(new Date(`${today}T12:00:00`));
  let loaded!: { migrations: typeof MigrationsModule; privacyAlert: typeof PrivacyAlertModule; storage: typeof StorageModule };
  jest.isolateModules(() => {
    require('~/framework/util/storage/mmkv').mmkvInstance.reset();
    loaded = {
      migrations: require('~/framework/util/storage/migrations'),
      privacyAlert: require('./privacy-alert'),
      storage: require('./storage'),
    };
  });
  // What the app does at its startup: the storage of the module is declared (and migrated)
  await loaded.migrations.runDeviceStorageMigrations([loaded.storage.mediaStorage]);
  return loaded;
};

/** Presses the button of the alert that was shown. */
const confirm = () => (Alert.alert as jest.Mock).mock.calls.at(-1)[2][0].onPress();

describe('showPrivacyAlert', () => {
  beforeEach(() => {
    (Alert.alert as jest.Mock).mockClear();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('shows the alert the first time, and does the action once the user confirmed', async () => {
    const { privacyAlert } = await setup('2026-10-29');
    const action = jest.fn();
    privacyAlert.showPrivacyAlert(action);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
    confirm();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('keeps the day it was shown', async () => {
    const { privacyAlert, storage } = await setup('2026-10-29');
    privacyAlert.showPrivacyAlert(jest.fn());
    expect(storage.mediaStorage.getString('privacyAlertDate')).toBe('2026-10-29');
  });

  it('does the action without the alert when it was already shown today', async () => {
    const { privacyAlert, storage } = await setup('2026-10-29');
    storage.mediaStorage.set('privacyAlertDate', '2026-10-29');
    const action = jest.fn();
    privacyAlert.showPrivacyAlert(action);
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('shows the alert again on another day', async () => {
    const { privacyAlert, storage } = await setup('2026-10-30');
    storage.mediaStorage.set('privacyAlertDate', '2026-10-29');
    privacyAlert.showPrivacyAlert(jest.fn());
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });

  it('shows the alert when the saved date can not be read', async () => {
    const { privacyAlert, storage } = await setup('2026-10-29');
    storage.mediaStorage.set('privacyAlertDate', 'garbage');
    privacyAlert.showPrivacyAlert(jest.fn());
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
});
