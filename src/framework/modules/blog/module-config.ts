import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type reducer from './reducer';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  name: 'blog',
  entcoreScope: ['blog'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === '/blog',
  displayI18n: 'blog.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'blog', fill: theme.palette.complementary.indigo.regular },
});
