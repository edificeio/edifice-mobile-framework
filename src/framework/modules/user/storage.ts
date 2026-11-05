import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface UserStorageData {}

export interface UserPreferencesData {
  'sent-notification-filters': Record<string, boolean>;
  'theme': number;
}

export const storage = Storage.slice<UserStorageData>().withModule(moduleConfig);

export const preferences = Storage.preferences<UserPreferencesData>(moduleConfig, () => {});

export const getSentNotificationFilters = (
  types: readonly string[],
  saved: Record<string, boolean> = preferences.getJSON('sent-notification-filters') ?? {},
): Record<string, boolean> => Object.fromEntries(types.map(type => [type, saved[type] ?? true]));

export const setSentNotificationFilters = (selection: Record<string, boolean>) =>
  preferences.setJSON('sent-notification-filters', selection);
