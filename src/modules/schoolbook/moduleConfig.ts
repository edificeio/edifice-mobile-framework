import theme from '~/app/theme';
import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

import { ISchoolbook_State } from './reducer';

export default createNavigableModuleConfig<'schoolbook', ISchoolbook_State>({
  name: 'schoolbook',
  displayName: 'schoolbook.tabName',
  iconName: 'chat3',
  iconColor: theme.themeOpenEnt.green,
  matchEntcoreApp: '/schoolbook',
  entcoreScope: ['schoolbook'],
  registerAs: 'myAppsModule',
});
