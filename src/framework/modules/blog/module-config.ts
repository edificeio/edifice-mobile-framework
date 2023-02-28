import type reducer from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  name: 'blog',
  entcoreScope: ['blog'],
  matchEntcoreApp: '/blog',
  displayI18n: 'blog.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'blog', fill: theme.palette.complementary.indigo.regular },
});
