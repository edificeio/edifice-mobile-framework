import { EntModule } from '~/app/module';
import { getStore } from '~/app/store';
import { I18n } from '~/util/i18n';

import myAppsHomeScreen from './screens/home';
import { createMyAppsSessionHooks } from './session';
import { storage } from './storage';
import reducer from './store';

// Loads the apps (blocking the sign-in) and the preferences (see `session.ts`)
const { onSessionStart, sessionSetup } = createMyAppsSessionHooks({
  dispatch: action => getStore().dispatch(action),
  translate: key => I18n.get(key),
});

export default new EntModule({
  entry: 'myapps/home',
  entTrackingName: 'Portal',
  // Always available: no `matchEntcoreApp`, which would require the app `Portal` in the rights
  hasRight: () => true,
  name: 'myapps',
  onSessionStart,
  redux: { reducer },
  screens: {
    'myapps/home': myAppsHomeScreen,
  },
  sessionSetup,
  storages: [storage],
  tab: {
    iconActive: 'ui-applications-fill',
    iconInactive: 'ui-applications',
    order: 40,
    testId: 'tabbar-myapps',
  },
});
