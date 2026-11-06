/**
 * @deprecated Moved to `~/modules/myapps/storage`: in the screens, use `useStorageBoolean(storage, 'show-all-apps')` and
 * `useStorageJSON(storage, 'onboarding')`. These functions remain for the former screens.
 */
import { OnboardingData, storage } from '~/modules/myapps/storage';

/** @deprecated */
export type MyAppsOnboardingData = OnboardingData;

/** @deprecated */
export const readShowAllApps = (): boolean => storage.getBoolean('show-all-apps') ?? true;

/** @deprecated */
export const writeShowAllApps = (value: boolean) => {
  storage.set('show-all-apps', value);
};

/** @deprecated */
export const readMyAppsOnboardingSeen = (): MyAppsOnboardingData | undefined => storage.getJSON('onboarding');

/** @deprecated */
export const writeMyAppsOnboardingSeen = (version: string) => {
  storage.setJSON('onboarding', { seen: true, version });
};

export { storage };
