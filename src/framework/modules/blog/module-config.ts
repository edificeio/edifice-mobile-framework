import type reducer from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.blog.accentColors,
  displayI18n: 'blog-tabname',
  displayPicture: theme.apps.blog.icon,
  entcoreScope: ['blog'],

  matchEntcoreApp: '/blog',
  name: 'blog',
  storageName: 'blog',
});
