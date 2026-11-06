/**
 * State of « Mes applis » in the redux store: the apps and the preferences, apart (they change independently). What depends on the
 * modules of the app (how an app opens…) is not kept: it is computed when read.
 */
import { AppsPreferences, EMPTY_PREFERENCES, EntApp } from '~/modules/myapps/model';

export type LoadStatus = 'idle' | 'loaded' | 'error';

export interface Loadable<Data> {
  status: LoadStatus;
  data: Data;
}

export interface MyAppsState {
  /** All the apps of the user, listed or not (`GET /api/me/applications`). */
  apps: Loadable<EntApp[]>;
  /** The preferences of the user (`/userbook/preference/apps`). */
  preferences: Loadable<AppsPreferences>;
  /** The onboarding was shown automatically during this session. */
  onboardingShown: boolean;
}

/** What the selectors need of the global state: the reducer is registered under the name of the module. */
export interface MyAppsRootState {
  myapps: MyAppsState;
}

export const initialState: MyAppsState = {
  apps: { data: [], status: 'idle' },
  onboardingShown: false,
  preferences: { data: EMPTY_PREFERENCES, status: 'idle' },
};
