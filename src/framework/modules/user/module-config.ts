import type { UserState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'user', UserState>({
  displayAs: 'tabModule',

  displayI18n: 'user-moduleconfig-myaccount',

  displayOrder: 5,

  displayPicture: { name: 'profile-off', type: 'Icon' },

  entcoreScope: [],

  displayPictureFocus: { name: 'profile-on', type: 'Icon' },

  // There is no corresponding backend app
  hasRight: () => true,

  matchEntcoreApp: () => false,

  name: 'user',
  // By the way, this module must always be available
  storageName: 'user',
  testID: 'tabbar-account',
});
