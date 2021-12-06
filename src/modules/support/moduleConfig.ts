import { ISupport_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';
import { CommonStyles } from '~/styles/common/styles';

export default createNavigableModuleConfig<'support', ISupport_State>({
  name: 'support',
  displayName: 'support',
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('SUPPORT'),
  entcoreScope: ['support'],
  iconName: 'help-circled',
  group: true,
  iconColor: CommonStyles.themeOpenEnt.green,
  registerAs: 'myAppsModule',
});
