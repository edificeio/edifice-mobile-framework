import moduleConfig from '~/framework/modules/myapps/module-config';
import { Storage } from '~/framework/util/storage';

export interface MyAppsOnboardingStorageData {
  seen: boolean;
  version: string;
}

type MyAppsStorageMap = {
  'showAllApps': boolean;
  'onboarding-storage-data'?: MyAppsOnboardingStorageData;
};

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

const myAppsStorage = Storage.preferences<MyAppsStorageMap>(moduleConfig, function () {
  Storage.global.delete(oldStorageKey);
});

export const readMyAppsPreferences = (): boolean => {
  return myAppsStorage.getBoolean('showAllApps') ?? false;
};

export const writeShowAllApps = (value: boolean) => {
  myAppsStorage.set('showAllApps', value);
};

export const readMyAppsOnboarding = (): MyAppsOnboardingStorageData | undefined => {
  return myAppsStorage.getJSON('onboarding-storage-data');
};

export const writeMyAppsOnboardingSeen = (version: string) => {
  myAppsStorage.setJSON('onboarding-storage-data', {
    seen: true,
    version,
  });
};

export const storage = myAppsStorage;
