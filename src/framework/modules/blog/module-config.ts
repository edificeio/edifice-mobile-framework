import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type reducer from './reducer';

export const moduleColor = appConf.is1d ? theme.palette.complementary.orange : theme.palette.complementary.indigo;

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  name: 'blog',
  entcoreScope: ['blog'],
  matchEntcoreApp: '/blog',
  displayI18n: 'blog-tabname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'blog', fill: moduleColor.regular },
});
