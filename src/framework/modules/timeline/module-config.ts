import type { TimelineState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'timeline', TimelineState>({
  displayAs: 'tabModule',
  displayI18n: 'timeline-tabname',
  displayOrder: 0,
  displayPicture: { name: 'nouveautes-off', type: 'Icon' },
  entcoreScope: ['timeline', 'userbook'],

  displayPictureFocus: { name: 'nouveautes-on', type: 'Icon' },

  hasRight: () => true,

  matchEntcoreApp: app => app.prefix === '/timeline',

  name: 'timeline',
  // The timeline is always displayed
  storageName: 'timeline',
  testID: 'tabbar-news',
});
