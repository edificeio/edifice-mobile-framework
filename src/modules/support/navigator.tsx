import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import SupportCreateTicketScreen from './screens/create-ticket';

export default () =>
  createStackNavigator(
    {
      [moduleConfig.routeName]: {
        screen: SupportCreateTicketScreen,
      },
    },
    {
      headerMode: 'none',
    },
  );
