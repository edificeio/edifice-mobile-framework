/**
 * User module
 * The account of the user. It replaces the legacy user module (`framework/modules/user`), which is brought here step by step:
 * for now it only has the home screen.
 */

import { EntModule } from '~/app/module';

import UserHomeScreen from './screens/home';

export default new EntModule({
  name: 'user',
  screens: {
    user: UserHomeScreen,
  },
});
