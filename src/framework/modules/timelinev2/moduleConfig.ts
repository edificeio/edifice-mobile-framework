import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ITimeline_State } from './reducer';

const isXmasThemeOn = true;
export default new NavigableModuleConfig<'timelinev2', ITimeline_State>({
  name: 'timelinev2',
  entcoreScope: ['timeline', 'userbook'],
  matchEntcoreApp: entcoreApp => true, // The timeline is always displayed

  routeName: 'timeline',
  displayI18n: 'timeline.tabName',
  displayAs: 'tabModule',
  displayOrder: 0,
  displayPicture: { type: 'Icon', name: `${isXmasThemeOn ? 'xmas-' : ''}nouveautes-off` },
  displayPictureFocus: { type: 'Icon', name: `${isXmasThemeOn ? 'xmas-' : ''}nouveautes-on` },
});
