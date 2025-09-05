import type reducer from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  displayAs: 'myAppsModule',
  displayI18n: 'blog-tabname',
  displayPicture: { fill: theme.palette.complementary.orange.regular, name: 'blog', type: 'Svg' },
  entcoreScope: ['blog'],

  matchEntcoreApp: '/blog',
  name: 'blog',
  storageName: 'blog',
});
