import type { WikiStore } from './store';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'wiki', WikiStore>({
  displayAs: 'myAppsModule',
  displayColor: theme.palette.complementary.blue,
  displayI18n: 'wiki-module-title',
  displayOrder: 0,
  displayPicture: { name: 'wiki', type: 'Svg' },
  entcoreScope: ['wiki', 'explorer'],
  matchEntcoreApp: '/wiki',
  name: 'wiki',
  storageName: 'wiki',
});
