import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import FormDistributionListScreen from './screens/FormDistributionListScreen';
import FormDistributionScreen from './screens/FormDistributionScreen';

export default () =>
  createStackNavigator(
    {
      [moduleConfig.routeName]: {
        screen: FormDistributionListScreen,
      },
      [`${moduleConfig.routeName}/distribution`]: {
        screen: FormDistributionScreen,
      },
    },
    {
      headerMode: 'none',
    },
  );
