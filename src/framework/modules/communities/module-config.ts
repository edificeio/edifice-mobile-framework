import { CommunitiesStore } from './store';

import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'communities', CommunitiesStore>({
  displayAs: ModuleType.TAB_MODULE,
  displayColor: theme.apps.communities.accentColors,
  displayI18n: 'communities-tabname',
  displayOrder: 2,
  displayPicture: theme.apps.communities.icon,
  displayPictureBlur: { name: 'communities-outline', type: 'Svg' },
  displayPictureFocus: { name: 'communities-fill', type: 'Svg' },

  entcoreScope: ['communities'],
  matchEntcoreApp: '/communities',

  name: 'communities',
  storageName: 'communities',
});
