import { CommunitiesStore } from './store';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'communities', CommunitiesStore>({
  displayAs: 'tabModule',
  displayColor: theme.apps.communities.accentColors,
  displayI18n: 'communities.tabName',
  displayOrder: 3,
  displayPicture: theme.apps.communities.icon,
  displayPictureFocus: theme.apps.communities.icon, // ToDo change active icon

  entcoreScope: ['communities'],
  matchEntcoreApp: '/communities',

  name: 'communities',
  storageName: 'communities',
});
