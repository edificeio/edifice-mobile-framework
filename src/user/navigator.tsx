import { createStackNavigator } from 'react-navigation-stack';

import ChangePasswordPage from './containers/ChangePasswordPage';
import ChildrenPage from './containers/ChildrenPage';
import LegalNoticeScreen from './containers/LegalNoticeScreen';
import ProfilePage from './containers/ProfilePage';
import PushNotifsSettingsScreen from './containers/PushNotifsSettingsScreen';
import RelativesPage from './containers/RelativesPage';
import SendEmailVerificationCodeScreen from './containers/SendEmailVerificationCodeScreen';
import StructuresPage from './containers/StructuresPage';
import UserPage from './containers/UserPage';
import VerifyEmailCodeScreen from './containers/VerifyEmailCodeScreen';
import WhoAreWeScreen from './containers/WhoAreWeScreen';

export default createStackNavigator(
  {
    Profile: {
      screen: UserPage,
    },

    NotifPrefs: {
      screen: PushNotifsSettingsScreen,
    },

    WhoAreWe: {
      screen: WhoAreWeScreen,
    },

    LegalNotice: {
      screen: LegalNoticeScreen,
    },

    MyProfile: {
      screen: ProfilePage,
    },

    ChangePassword: {
      screen: ChangePasswordPage,
    },

    SendEmailVerificationCode: {
      screen: SendEmailVerificationCodeScreen,
    },

    VerifyEmailCode: {
      screen: VerifyEmailCodeScreen,
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
  },
  {
    headerMode: 'none',
  },
);
