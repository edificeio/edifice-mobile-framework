/**
 * SignIn module
 * This module is **private**: global navigation cannot navigate to its screens.
 * It is included directly in auth screens as independant navigation
 */

import { CoreModule } from '~/app/module';

import AuthAccountsScreen from './screens/accounts';
import SignInActivationScreen from './screens/activation';
import SignInCredentialsScreen from './screens/credentials';
import SignInDiscoveryClassScreen from './screens/discovery-class';
import AuthForgotScreen from './screens/forgot';
import AuthPlatformsScreen from './screens/platforms';
import SignInRedirectScreen from './screens/redirect';
import SignInRenewPasswordScreen from './screens/renew-password';
import SignInWayfScreen from './screens/wayf';
import SignInWayfIntroScreen from './screens/wayf-intro';
import AuthWelcomeScreen from './screens/welcome';

export default new CoreModule({
  modals: {
    'sign-in/forgot': AuthForgotScreen,
  },
  name: 'sign-in',
  screens: {
    'sign-in/accounts': AuthAccountsScreen,
    'sign-in/activation': SignInActivationScreen,
    'sign-in/credentials': SignInCredentialsScreen,
    'sign-in/discovery-class': SignInDiscoveryClassScreen,
    'sign-in/platforms': AuthPlatformsScreen,
    'sign-in/redirect': SignInRedirectScreen,
    'sign-in/renew-password': SignInRenewPasswordScreen,
    'sign-in/wayf': SignInWayfScreen,
    'sign-in/wayf-intro': SignInWayfIntroScreen,
    'sign-in/welcome': AuthWelcomeScreen,
  },
});
