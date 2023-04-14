import { createStackNavigator } from 'react-navigation-stack';

import ChangePasswordPage from './containers/ChangePasswordPage';
import LegalNoticeScreen from './containers/LegalNoticeScreen';
import PushNotifsSettingsScreen from './containers/PushNotifsSettingsScreen';
import StructuresPage from './containers/StructuresPage';
import WhoAreWeScreen from './containers/WhoAreWeScreen';
import XmasScreen from './containers/XmasScreen';
import UserEmailScreen from './containers/email';
import MFAScreen from './containers/mfa';
import UserMobileScreen from './containers/mobile';
import UserAccountScreen from './containers/user-account';
import UserProfileScreen from './containers/user-profile';

export default createStackNavigator(
  {
    Profile: {
      screen: UserAccountScreen,
    },

    NotifPrefs: {
      screen: PushNotifsSettingsScreen,
    },

    Xmas: {
      screen: XmasScreen,
    },

    WhoAreWe: {
      screen: WhoAreWeScreen,
    },

    LegalNotice: {
      screen: LegalNoticeScreen,
    },

    MyProfile: {
      screen: UserProfileScreen,
    },

    ChangePassword: {
      screen: ChangePasswordPage,
    },

    UserMobile: {
      screen: UserMobileScreen,
    },

    UserEmail: {
      screen: UserEmailScreen,
    },

    MFA: {
      screen: MFAScreen,
    },

    Structures: {
      screen: StructuresPage,
    },
  },
  {
    headerMode: 'none',
  },
);
