import { Storage } from '~/framework/util/storage';

export interface MyAppsOnboardingData {
  seen: boolean;
  version: string;
}

type MyAppsPreferencesData = {
  'show-all-apps': boolean;
  'onboarding'?: MyAppsOnboardingData;
};

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

const myAppsStorage = Storage.account<MyAppsPreferencesData>({
  migrations: [
    {
      id: 'remove-info-bubble-v1',
      run: () => {
        Storage.global.remove(oldStorageKey);
      },
    },
  ],
  namespace: 'myapps',
});

export const readShowAllApps = (): boolean => {
  // `true` while nothing is stored, as it always was: `getBoolean` used to read a missing boolean as `true`, whatever the default here
  // said (see `StorageHandler.getBoolean`). Kept so the app behaves the same for the users who never changed it.
  return myAppsStorage.getBoolean('show-all-apps') ?? true;
};

export const writeShowAllApps = (value: boolean) => {
  myAppsStorage.set('show-all-apps', value);
};

export const readMyAppsOnboardingSeen = (): MyAppsOnboardingData | undefined => {
  return myAppsStorage.getJSON('onboarding');
};

export const writeMyAppsOnboardingSeen = (version: string) => {
  myAppsStorage.setJSON('onboarding', {
    seen: true,
    version,
  });
};

export const storage = myAppsStorage;
