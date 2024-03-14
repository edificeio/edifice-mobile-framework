//const STORAGE_KEY = `${moduleConfig.name}.showAverageColors`;^

import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface CompetencesStorageData {
  'show-average-colors': boolean;
}

const oldStorageKey = 'competences.showAverageColors';

export const storage = Storage.create<CompetencesStorageData>(moduleConfig).setAppInit(function () {
  const oldValue = Storage.global.getString(oldStorageKey) as 'true' | 'false' | undefined;
  if (oldValue === 'true') {
    this.set('show-average-colors', true);
  }
  Storage.global.delete(oldStorageKey);
});
