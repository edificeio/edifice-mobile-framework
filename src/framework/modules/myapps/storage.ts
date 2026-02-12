import moduleConfig from '~/framework/modules/myapps/module-config';
import { Storage } from '~/framework/util/storage';

export interface MyAppsPreferencesStorageData {
  showAllApps: boolean;
}

export interface MyAppsOnboardingStorageData {
  seen: boolean;
  version: string;
}

export interface MyAppsStorageData {
  preferences?: MyAppsPreferencesStorageData;
  onboarding?: MyAppsOnboardingStorageData;
}

type MyAppsStorageMap = {
  myapps: MyAppsStorageData;
};

const STORAGE_KEY: keyof MyAppsStorageMap = 'myapps';

const myAppsStorage = Storage.preferences<MyAppsStorageMap>(moduleConfig, function () {});

export const readMyAppsPreferences = (): MyAppsPreferencesStorageData => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  return data?.preferences ?? { showAllApps: false };
};

export const writeShowAllApps = (value: boolean) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);

  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    preferences: {
      ...(data?.preferences ?? {}),
      showAllApps: value,
    },
  });
};

export const readMyAppsOnboarding = (): MyAppsOnboardingStorageData | undefined => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  return data?.onboarding;
};

export const writeMyAppsOnboardingSeen = (version: string) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);

  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    onboarding: {
      seen: true,
      version,
    },
  });
};

export const resetMyAppsStorage = () => {
  myAppsStorage.delete(STORAGE_KEY);
};
