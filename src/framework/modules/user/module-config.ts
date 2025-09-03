import type { UserState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'user', UserState>({
  displayAs: '',

  displayI18n: 'user-moduleconfig-myaccount',

  entcoreScope: [],

  // There is no corresponding backend app
  hasRight: () => true,

  matchEntcoreApp: () => false,

  name: 'user',
  // By the way, this module must always be available
  storageName: 'user',
  testID: 'tabbar-account',
});
