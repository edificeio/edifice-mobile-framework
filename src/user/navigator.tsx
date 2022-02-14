import { createStackNavigator } from 'react-navigation-stack';

import ChangePasswordPage from './containers/ChangePasswordPage';
import ChildrenPage from './containers/ChildrenPage';
import LegalNoticeScreen from './containers/LegalNoticeScreen';
import ProfilePage from './containers/ProfilePage';
import PushNotifsSettingsScreen from './containers/PushNotifsSettingsScreen';
import RelativesPage from './containers/RelativesPage';
import StructuresPage from './containers/StructuresPage';
import UserPage, { UserPageNavigationOptions } from './containers/UserPage';

export default createStackNavigator({
  Profile: {
    navigationOptions: UserPageNavigationOptions,
    screen: UserPage,
  },

  NotifPrefs: {
    navigationOptions: {
      header: () => null,
    },
    screen: PushNotifsSettingsScreen,
  },

  LegalNotice: {
    navigationOptions: {
      // Note: a FakeHeader is used inside LegalNoticeScreen, so that it doesn't limite the backdrop shadow
      header: () => null,
    },
    screen: LegalNoticeScreen,
  },

  MyProfile: {
    screen: ProfilePage,
  },

  ChangePassword: {
    screen: ChangePasswordPage,
  },

  Structures: {
    screen: StructuresPage,
  },

  Relatives: {
    screen: RelativesPage,
  },

  Children: {
    screen: ChildrenPage,
  },
});
