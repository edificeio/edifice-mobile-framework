import type { UserState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'user', UserState>({
  displayAs: ModuleType.HIDDEN_MODULE,
  displayI18n: 'user-moduleconfig-myaccount',

  entcoreScope: [],

  // There is no corresponding backend app
  hasRight: () => true,
  matchEntcoreApp: () => false,

  name: 'user',
  storageName: 'user',
  testID: 'tabbar-account',
});
