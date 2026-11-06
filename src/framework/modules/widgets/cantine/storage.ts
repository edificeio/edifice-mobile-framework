import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface CantinePreferencesData {
  'selected-structure': string;
}

export const preferences = Storage.preferences<CantinePreferencesData>(moduleConfig, function () {});

export const selectedStructureStorage = {
  read: () => preferences.getString('selected-structure') ?? undefined,
  write: (uai: string) => preferences.set('selected-structure', uai),
};
