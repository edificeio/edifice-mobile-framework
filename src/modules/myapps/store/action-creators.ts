/**
 * Action types and action creators of « Mes applis »: what happened, for the reducer. What the user does (load, save…) is in `~/modules/myapps/actions`.
 */
import type { AppsPreferences, EntApp } from '~/modules/myapps/model';

export const myAppsActionTypes = {
  appsFailed: 'MYAPPS_APPS_FAILED',
  appsLoaded: 'MYAPPS_APPS_LOADED',
  onboardingShown: 'MYAPPS_ONBOARDING_SHOWN',
  preferencesFailed: 'MYAPPS_PREFERENCES_FAILED',
  preferencesLoaded: 'MYAPPS_PREFERENCES_LOADED',
} as const;

export const myAppsActions = {
  appsFailed: () => ({ type: myAppsActionTypes.appsFailed }),
  appsLoaded: (data: EntApp[]) => ({ data, type: myAppsActionTypes.appsLoaded }),
  /** The onboarding was shown automatically: not again during this session. */
  onboardingShown: () => ({ type: myAppsActionTypes.onboardingShown }),
  preferencesFailed: () => ({ type: myAppsActionTypes.preferencesFailed }),
  preferencesLoaded: (data: AppsPreferences) => ({ data, type: myAppsActionTypes.preferencesLoaded }),
};

export type MyAppsAction = ReturnType<(typeof myAppsActions)[keyof typeof myAppsActions]>;
