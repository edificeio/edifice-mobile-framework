import { Storage } from '~/framework/util/storage';

export interface TimelineStorageData {}

export const storage = Storage.device<TimelineStorageData>({ namespace: 'pronote' });

export interface PronotePreferencesData {
  'carnet-de-bord.selected-user': string;
}

const oldStorageKey = `pronote.CarnetDeBord.selectedUserId`;

export const preferences = Storage.account<PronotePreferencesData>({
  migrations: [
    {
      id: 'selected-user-v1',
      run: handler => {
        const oldDataStr = Storage.global.getString(oldStorageKey);
        const oldData = oldDataStr ? (JSON.parse(oldDataStr) as string) : undefined;
        if (oldData) {
          handler.set('carnet-de-bord.selected-user', oldData);
          Storage.global.remove(oldStorageKey);
        }
      },
    },
  ],
  namespace: 'pronote',
});
