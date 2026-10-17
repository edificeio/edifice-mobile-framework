/**
 * Auth module
 *
 */

import { CoreModule } from '~/app/module';

import AuthAddAccountScreen from './screens/add-account';
import AuthLoadAccountScreen from './screens/load-account';
import AuthManageAccountsScreen from './screens/manage-accounts';
import AuthSwitchAccountScreen from './screens/switch-account';

export default new CoreModule({
  modals: {
    'auth/add-account': AuthAddAccountScreen,
    'auth/manage-accounts': AuthManageAccountsScreen,
    'auth/switch-account': AuthSwitchAccountScreen,
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
