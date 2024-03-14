import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';
import { INotifFilterSettings } from './reducer/notif-settings/notif-filter-settings';
import { AuthLoggedAccount } from '../auth/model';

export interface TimelineStorageData {}

export const storage = Storage.create<TimelineStorageData>(moduleConfig).setAppInit(function () {});

export interface TimelinePreferencesData {
  'notif-filters': INotifFilterSettings;
}

const getOldStorageKeys = (session: AuthLoggedAccount) => ({
  '1.5.0-rc6': 'timelinev2.notifFilterSettings',
  '1.5.0-rc7': `timelinev2.notifFilterSettings.${session.user.id}`,
  '1.9.6': `timeline.notifFilterSettings.${session.user.id}`,
});

export const preferences = Storage.preferences<TimelinePreferencesData>(moduleConfig, async function (session) {
  // notif-filters data migration
  const filters = this.getJSON('notif-filters');
  const oldKeys = getOldStorageKeys(session);

  if (!filters) {
    let str: string | undefined;
    for (const version in oldKeys) {
      str = str ?? Storage.global.getString(oldKeys[version]);
    }
    if (str) this.setJSON('notif-filters', JSON.parse(str));
  }

  for (const version in oldKeys) {
    Storage.global.delete(oldKeys[version]);
  }
});
