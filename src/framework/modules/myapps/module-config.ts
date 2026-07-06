import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { AppsInfoState } from './types';

export default new NavigableModuleConfig<'myapps', AppsInfoState>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 3,
  displayPictureBlur: { name: 'icon-apps-off', type: 'Icon' },
  displayPictureFocus: { name: 'icon-apps-on', type: 'Icon' },
  entcoreScope: [],
  entcoreTrackingName: 'Portal',
  hasRight: () => true,
  matchEntcoreApp: 'Portal',
  matchEntcoreWidget: () => false,
  name: 'myapps',
  storageName: 'myapps',
  testID: 'tabbar-myapps',
});
