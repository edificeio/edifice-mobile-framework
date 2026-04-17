import type { AppsInfoState } from './types';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'myapps', AppsInfoState>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 3,
  displayPictureBlur: { name: 'icon-apps-off', type: 'Icon' },
  displayPictureFocus: { name: 'icon-apps-on', type: 'Icon' },
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: 'myapps',
  matchEntcoreWidget: () => false,
  name: 'myapps',
  storageName: 'myapps',
  tabDisplayName: 'myapp-appname',
  testID: 'myapps-home',
});
