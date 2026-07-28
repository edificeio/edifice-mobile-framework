import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface UserStorageData {}

export interface UserPreferencesData {
  theme: number;
}

export const storage = Storage.slice<UserStorageData>().withModule(moduleConfig);

export const preferences = Storage.preferences<UserPreferencesData>(moduleConfig, () => {});
