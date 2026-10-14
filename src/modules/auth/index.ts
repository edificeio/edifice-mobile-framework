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
  scope: [
    'auth',
    'userbook',
    'directory',
    /* ToDo: put the followg scopes anywhere else that not belongs to auth module */
    'infra', // seems to be tracking related
    'portal', // dont know if used somewhere
    'userinfo', // wtf is this thing ?
    'timeline', // needed for push-notifications at login
  ],
  screens: {
    'auth/load-account': AuthLoadAccountScreen,
  },
});
