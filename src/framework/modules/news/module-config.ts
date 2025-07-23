import type { NewsState } from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'news', NewsState>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.news.accentColors,
  displayI18n: 'news-moduleconfig-tabname',
  displayPicture: theme.apps.news.icon,
  entcoreScope: ['actualites'],

  matchEntcoreApp: '/actualites',
  name: 'news',
  storageName: 'news',
});
