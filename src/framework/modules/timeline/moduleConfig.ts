import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ITimeline_State } from './reducer';

export default new NavigableModuleConfig<'timeline', ITimeline_State>({
  name: 'timeline',
  entcoreScope: ['timeline', 'userbook'],
  matchEntcoreApp: app => app.prefix === '/timeline',
  hasRight: () => true, // The timeline is always displayed

  displayI18n: 'timeline.tabName',
  displayAs: 'tabModule',
  displayOrder: 0,
  displayPicture: { type: 'Icon', name: 'nouveautes-off' },
  displayPictureFocus: { type: 'Icon', name: 'nouveautes-on' },
});
