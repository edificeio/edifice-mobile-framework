import { createStackNavigator } from 'react-navigation-stack';

import ChangePasswordPage from './containers/ChangePasswordPage';
import ChildrenPage from './containers/ChildrenPage';
import LegalNoticeScreen from './containers/LegalNoticeScreen';
import ProfilePage from './containers/ProfilePage';
import PushNotifsSettingsScreen from './containers/PushNotifsSettingsScreen';
import RelativesPage from './containers/RelativesPage';
import SendEmailVerificationCodeScreen from './containers/SendEmailVerificationCodeScreen';
import StructuresPage from './containers/StructuresPage';
import VerifyEmailCodeScreen from './containers/VerifyEmailCodeScreen';
import WhoAreWeScreen from './containers/WhoAreWeScreen';
import XmasScreen from './containers/XmasScreen';
import UserScreen from './containers/user-profile';

export default createStackNavigator(
  {
    Profile: {
      screen: UserScreen,
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
