/**
 * SignIn module
 * This module is **private**: global navigation cannot navigate to its screens.
 * It is included directly in auth screens as independant navigation
 */

import { CoreModule } from '~/app/module';

import AuthForgotScreen from './screens/forgot';
import AuthPlatformsScreen from './screens/platforms';
import AuthWelcomeScreen from './screens/welcome';

export default new CoreModule({
  modals: {
    'signIn/forgot': AuthForgotScreen,
  },
  name: 'signIn',
  screens: {
    'signIn/platforms': AuthPlatformsScreen,
    'signIn/welcome': AuthWelcomeScreen,
  },
});
