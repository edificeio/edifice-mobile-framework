import moduleConfig from '~/framework/modules/myapps/module-config';
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

const myAppsStorage = Storage.preferences<MyAppsPreferencesData>(moduleConfig, function () {
  Storage.global.delete(oldStorageKey);
});

export const readShowAllApps = (): boolean => {
  return myAppsStorage.getBoolean('show-all-apps') ?? false;
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
