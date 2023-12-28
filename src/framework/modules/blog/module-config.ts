import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type reducer from './reducer';

export const moduleColor = theme.palette.complementary.indigo;

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  name: 'blog',
  entcoreScope: ['blog'],
  matchEntcoreApp: '/blog',
  displayI18n: 'blog-tabname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'blog', fill: moduleColor.regular },
});
