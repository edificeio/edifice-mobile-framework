import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ISchoolbook_State } from './reducer';

export default new NavigableModuleConfig<'schoolbook', ISchoolbook_State>({
  name: 'schoolbook',
  entcoreScope: ['schoolbook'],
  matchEntcoreApp: '/schoolbook',

  displayI18n: 'schoolbook.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Icon', name: 'chat3', color: theme.themeOpenEnt.green },
});
