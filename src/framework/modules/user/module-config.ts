import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { UserState } from './reducer';

export default new NavigableModuleConfig<'user', UserState>({
  name: 'user',
  entcoreScope: [],
  matchEntcoreApp: () => true,

  displayI18n: 'MyAccount',
  displayAs: 'tabModule',
  displayOrder: 5,
  displayPicture: { type: 'Icon', name: 'profile-off' },
  displayPictureFocus: { type: 'Icon', name: 'profile-on' },
});
