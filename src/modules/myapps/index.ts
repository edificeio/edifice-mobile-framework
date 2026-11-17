import { EntModule } from '~/app/module';
import { getStore } from '~/app/store';

import myAppsAppActionsModal from './screens/app-actions';
import myAppsFavoritesModal from './screens/favorites';
import myAppsFavoritesReorderModal from './screens/favorites-reorder';
import myAppsHomeScreen from './screens/home';
import myAppsMenuModal from './screens/menu';
import myAppsOnboardingModal from './screens/onboarding';
import { createMyAppsSessionHooks } from './session';
import { storage } from './storage';
import reducer from './store';

// Loads the apps (blocking the sign-in) and the preferences (see `session.ts`)
const { onSessionStart, sessionSetup } = createMyAppsSessionHooks({
  dispatch: action => getStore().dispatch(action),
});

export default new EntModule({
  entries: {
    myApps: { route: 'myapps/home' },
    tab: {
      iconActive: 'ui-applications-fill',
      iconInactive: 'ui-applications',
      order: 40,
      route: 'myapps/home',
      testId: 'tabbar-myapps',
    },
  },
  entTrackingName: 'Portal',
  // « Mes applis » is the app `Portal`: a right every user has (always sent by the server). It gives its label to the tab.
  matchEntcoreApp: 'Portal',
  modals: {
    'myapps/app-actions': myAppsAppActionsModal,
    'myapps/favorites': myAppsFavoritesModal,
    'myapps/favorites-reorder': myAppsFavoritesReorderModal,
    'myapps/menu': myAppsMenuModal,
    'myapps/onboarding': myAppsOnboardingModal,
  },
  name: 'myapps',
  onSessionStart,
  redux: { reducer },
  scope: ['portal', 'userbook'],
  screens: {
    'myapps/home': myAppsHomeScreen,
  },
  sessionSetup,
  storages: [storage],
});
