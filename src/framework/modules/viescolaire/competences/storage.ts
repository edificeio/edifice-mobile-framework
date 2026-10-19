import { Storage } from '~/framework/util/storage';

export interface CompetencesStorageData {
  'show-average-colors': boolean;
}

const oldStorageKey = 'competences.showAverageColors';

export const storage = Storage.device<CompetencesStorageData>({
  migrations: [
    {
      id: 'show-average-colors-v1',
      run: handler => {
        const oldValue = Storage.global.getString(oldStorageKey) as 'true' | 'false' | undefined;
        // Only `true` is carried over: a missing value reads as `true` anyway (see `readShowAllApps`-like adaptation in the home screen),
        // which is what `false` used to give too, as `getBoolean` read a missing boolean as `true`.
        if (oldValue === 'true') {
          handler.set('show-average-colors', true);
        }
        Storage.global.remove(oldStorageKey);
      },
    },
  ],
  namespace: 'competences',
});
