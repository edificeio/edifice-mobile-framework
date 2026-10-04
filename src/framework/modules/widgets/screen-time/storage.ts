import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface ScreenTimePreferencesData {
  'screen-time.selected-user': string;
}

export const preferences = Storage.preferences<ScreenTimePreferencesData>(moduleConfig, function () {});

export const selectedChildStorage = {
  read: () => preferences.getString('screen-time.selected-user') ?? undefined,
  write: (id: string) => preferences.set('screen-time.selected-user', id),
};
