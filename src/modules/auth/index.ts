/**
 * Auth module
 *
 */

import { CoreModule } from '~/app/module';

import AuthAddAccountScreen from './screens/add-account';
import AuthLoadAccountScreen from './screens/load-account';

export default new CoreModule({
  modals: {
    'auth/add-account': AuthAddAccountScreen,
  },
  name: 'auth',
  screens: {
    'auth/load-account': AuthLoadAccountScreen,
  },
});
