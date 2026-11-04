import { MyAppsRootState } from './state';

export const selectMyAppsState = (state: MyAppsRootState) => state.myapps;
export const selectApps = (state: MyAppsRootState) => state.myapps.apps;
export const selectPreferences = (state: MyAppsRootState) => state.myapps.preferences;
export const selectOnboardingShown = (state: MyAppsRootState) => state.myapps.onboardingShown;
