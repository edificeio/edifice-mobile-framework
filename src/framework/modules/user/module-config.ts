import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { UserState } from './reducer';

export default new NavigableModuleConfig<'user', UserState>({
  name: 'user',
  entcoreScope: [],
  matchEntcoreApp: () => false, // There is no corresponding backend app
  hasRight: () => true, // By the way, this module must always be available
  storageName: 'user',

  displayI18n: 'user-moduleconfig-myaccount',
  displayAs: 'tabModule',
  displayOrder: 5,
  displayPicture: { type: 'Icon', name: 'profile-off' },
  displayPictureFocus: { type: 'Icon', name: 'profile-on' },
  testID: 'tabbar-account',
});
