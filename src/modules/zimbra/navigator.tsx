import { createStackNavigator } from 'react-navigation-stack';

import DrawerNavigatorWrapper from './screens/DrawerNavigatorWrapper';
import MailContent from './screens/MailContent';
import NewMail from './screens/NewMail';
import Search from './screens/SearchFunction';

export default () =>
  createStackNavigator(
    {
      DrawerNavigator: DrawerNavigatorWrapper,
      mailDetail: MailContent,
      newMail: NewMail,
      search: Search,
    },
    { initialRouteName: 'DrawerNavigator', headerMode: 'none' },
  );
