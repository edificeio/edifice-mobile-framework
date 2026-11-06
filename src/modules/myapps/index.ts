import { EntModule } from '~/app/module';

import MyAppsHomeScreen from './screens/home';
import { storage } from './storage';
import reducer from './store';

export default new EntModule({
  entry: 'myapps/home',
  entTrackingName: 'Portal',
  // Always available: no `matchEntcoreApp`, which would require the app `Portal` in the rights
  hasRight: () => true,
  name: 'myapps',
  redux: { reducer },
  screens: {
    'myapps/home': { screen: MyAppsHomeScreen },
  },
  storages: [storage],
  tab: {
    iconActive: 'ui-applications-fill',
    iconInactive: 'ui-applications',
    order: 40,
    testId: 'tabbar-myapps',
  },
});
