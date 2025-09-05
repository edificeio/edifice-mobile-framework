import type { NewsState } from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export const fillColor = 'orange';

export default new NavigableModuleConfig<'news', NewsState>({
  displayAs: 'myAppsModule',
  displayI18n: 'news-moduleconfig-tabname',
  displayPicture: { fill: theme.palette.complementary[fillColor].regular, name: 'newsFeed', type: 'Svg' },
  entcoreScope: ['actualites'],

  matchEntcoreApp: '/actualites',
  name: 'news',
  storageName: 'news',
});
