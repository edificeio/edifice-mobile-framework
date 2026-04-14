import type { TimelineState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'timeline', TimelineState>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 0,
  displayPictureBlur: { name: 'nouveautes-off', type: 'Icon' },
  displayPictureFocus: { name: 'nouveautes-on', type: 'Icon' },
  entcoreScope: ['timeline', 'userbook'],
  hasRight: () => true,
  matchEntcoreApp: 'Timeline',
  name: 'timeline',
  // The timeline is always displayed
  storageName: 'timeline',
  tabDisplayName: 'timeline-tabname',
  testID: 'tabbar-news',
});
