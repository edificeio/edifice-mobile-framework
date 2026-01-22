import type { TimelineState } from './reducer';

import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'timeline', TimelineState>({
  displayAs: ModuleType.TAB_MODULE,
  displayColor: theme.apps.timeline.accentColors,
  displayI18n: 'timeline-tabname',
  displayOrder: 0,
  displayPicture: { name: 'nouveautes-off', type: 'Icon' },
  displayPictureFocus: { name: 'nouveautes-on', type: 'Icon' },

  entcoreScope: ['timeline', 'userbook'],

  hasRight: () => true,

  matchEntcoreApp: app => app.prefix === '/timeline',

  name: 'timeline',
  // The timeline is always displayed
  storageName: 'timeline',
  testID: 'tabbar-news',
});
