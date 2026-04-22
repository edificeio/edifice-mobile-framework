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
  'onboarding-by-account'?: Record<string, MyAppsOnboardingStorageData>;
  'infobubble-ack'?: boolean;
}

type MyAppsStorageMap = {
  myapps: MyAppsStorageData;
};

const STORAGE_KEY: keyof MyAppsStorageMap = 'myapps';

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

export const buildMyAppsOnboardingAccountKey = (platformName: string, userId: string) => `${platformName}:${userId}`;

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

export const readMyAppsOnboarding = (accountKey: string): MyAppsOnboardingStorageData | undefined => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  return data?.['onboarding-by-account']?.[accountKey];
};

export const writeMyAppsOnboardingSeen = (version: string, accountKey: string) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    'onboarding-by-account': {
      ...data?.['onboarding-by-account'],
      [accountKey]: {
        seen: true,
        version,
      },
    },
  });
};

export const resetMyAppsOnboardingForAccount = (accountKey: string) => {
  const data = myAppsStorage.getJSON(STORAGE_KEY);
  if (!data?.['onboarding-by-account']) return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [accountKey]: _removed, ...remainingOnboarding } = data['onboarding-by-account'];

  myAppsStorage.setJSON(STORAGE_KEY, {
    ...data,
    'onboarding-by-account': remainingOnboarding,
  });
};

export const resetMyAppsStorage = () => {
  myAppsStorage.delete(STORAGE_KEY);
};

export const storage = myAppsStorage;
