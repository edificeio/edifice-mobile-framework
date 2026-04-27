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
  'preferences'?: MyAppsPreferencesStorageData;
  'onboarding-by-account'?: MyAppsOnboardingStorageData;
  'infobubble-ack'?: boolean;
}

type MyAppsStorageMap = {
  'myapps-storage-data': MyAppsStorageData;
};

const STORAGE_KEY: keyof MyAppsStorageMap = 'myapps-storage-data';

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

const myAppsStorage = Storage.preferences<MyAppsStorageMap>(moduleConfig, function () {
  const oldValue = Storage.global.getString(oldStorageKey) as 'true' | 'false' | undefined;
  if (oldValue === 'true') {
    const data = this.getJSON(STORAGE_KEY) ?? {};
    this.setJSON(STORAGE_KEY, { ...data, 'infobubble-ack': true });
  }
  Storage.global.delete(oldStorageKey);
});

export const readMyAppsPreferences = (): MyAppsPreferencesStorageData => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  return data?.preferences ?? { showAllApps: false };
};

export const writeShowAllApps = (value: boolean) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);

  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    preferences: {
      ...data?.preferences,
      showAllApps: value,
    },
  });
};

export const readMyAppsOnboarding = (): MyAppsOnboardingStorageData | undefined => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  return data?.['onboarding-by-account'];
};

export const writeMyAppsOnboardingSeen = (version: string) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    'onboarding-by-account': {
      seen: true,
      version,
    },
  });
};

export const resetMyAppsStorage = () => {
  myAppsStorage.delete(STORAGE_KEY);
};

export const storage = myAppsStorage;
