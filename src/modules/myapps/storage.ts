import { Storage } from '~/framework/util/storage';

/** Stored when the user goes through the onboarding. */
export interface OnboardingData {
  seen: boolean;
  version: string;
}

/** The last version of the onboarding the user went through (see `isOnboardingSeen`). */
export const getSeenOnboardingVersion = (data: OnboardingData | undefined) => (data?.seen ? data.version : undefined);

type MyAppsStorageData = {
  /**
   * Show all the apps, or only the modules. Read it as `true` while nothing is stored, as it always was: `getBoolean` used to read a
   * missing boolean as `true` (see `StorageHandler.getBoolean`). Kept so the app behaves the same for the users who never changed it.
   */
  'show-all-apps': boolean;
  /** The onboarding the user went through (see `getSeenOnboardingVersion`). */
  'onboarding'?: OnboardingData;
};

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

export const storage = Storage.account<MyAppsStorageData>({
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
