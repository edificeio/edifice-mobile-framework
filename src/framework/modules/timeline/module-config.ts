import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { TimelineState } from './reducer';

export default new NavigableModuleConfig<'timeline', TimelineState>({
  name: 'timeline',
  entcoreScope: ['timeline', 'userbook'],
  matchEntcoreApp: app => app.prefix === '/timeline',
  hasRight: () => true, // The timeline is always displayed
  storageName: 'timeline',

  displayI18n: 'timeline-tabname',
  displayAs: 'tabModule',
  displayOrder: 0,
  displayPicture: { type: 'Icon', name: 'nouveautes-off' },
  displayPictureFocus: { type: 'Icon', name: 'nouveautes-on' },
  testID: 'tabbar-news',
});
