import type { WikiStore } from './store';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'wiki', WikiStore>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.wiki.accentColors,
  displayI18n: 'wiki-module-title',
  displayOrder: 0,
  displayPicture: theme.apps.wiki.icon,
  entcoreScope: ['wiki', 'explorer'],
  matchEntcoreApp: '/wiki',
  name: 'wiki',
  storageName: 'wiki',
});
