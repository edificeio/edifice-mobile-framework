import { CoreModule } from '~/app/module';

import MyAppsHomeScreen from './screens/home';

export default new CoreModule({
  name: 'myapps',
  screens: {
    'myapps/home': { screen: MyAppsHomeScreen },
  },
  tab: {
    iconActive: 'ui-applications-fill',
    iconInactive: 'ui-applications',
    order: 40,
    route: 'myapps/home',
    testId: 'tabbar-myapps',
  },
});
