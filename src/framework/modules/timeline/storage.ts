import { Storage } from '~/framework/util/storage';

import { INotifFilterSettings } from './reducer/notif-settings/notif-filter-settings';

export interface TimelineStorageData {}

export const storage = Storage.device<TimelineStorageData>({ namespace: 'timeline' });

export interface TimelinePreferencesData {
  'notif-filters': INotifFilterSettings;
}

const getOldStorageKeys = (accountId: string) => ({
  '1.5.0-rc6': 'timelinev2.notifFilterSettings',
  '1.5.0-rc7': `timelinev2.notifFilterSettings.${accountId}`,
  '1.9.6': `timeline.notifFilterSettings.${accountId}`,
});

export const preferences = Storage.account<TimelinePreferencesData>({
  migrations: [
    {
      id: 'notif-filters-v1',
      run: (handler, { accountId }) => {
        const filters = handler.getJSON('notif-filters');
        const oldKeys = getOldStorageKeys(accountId);

        if (!filters) {
          let str: string | undefined;
          for (const version in oldKeys) {
            str = str ?? Storage.global.getString(oldKeys[version]);
          }
          if (str) handler.setJSON('notif-filters', JSON.parse(str));
        }

        for (const version in oldKeys) {
          Storage.global.remove(oldKeys[version]);
        }
      },
    },
  ],
  namespace: 'timeline',
});
