import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IBlog_State } from './reducer';

export default new NavigableModuleConfig<'blog', IBlog_State>({
  name: 'blog',
  entcoreScope: ['blog'],
  matchEntcoreApp: '/blog',

  displayI18n: 'blog.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'blog', fill: theme.themeOpenEnt.indigo },
});
