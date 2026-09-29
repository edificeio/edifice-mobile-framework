import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface TimelineStorageData {}

export const storage = Storage.create<TimelineStorageData>({ storage: { namespace: moduleConfig.storageName } }).setAppInit(
  function () {},
);

export interface PronotePreferencesData {
  'carnet-de-bord.selected-user': string;
}

const oldStorageKey = `pronote.CarnetDeBord.selectedUserId`;

export const preferences = Storage.preferences<PronotePreferencesData>(
  { storage: { namespace: moduleConfig.storageName } },
  async function () {
    const oldDataStr = Storage.global.getString(oldStorageKey);
    const oldData = oldDataStr ? (JSON.parse(oldDataStr) as string) : undefined;
    if (oldData) {
      this.set('carnet-de-bord.selected-user', oldData);
      Storage.global.remove(oldStorageKey);
    }
  },
);
