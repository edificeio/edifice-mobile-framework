import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import reducer from './reducer';

export default new NavigableModuleConfig<'support', ReturnType<typeof reducer>>({
  name: 'support',
  entcoreScope: ['support'],
  matchEntcoreApp: '/support',

  displayI18n: 'support-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'support', fill: theme.palette.complementary.green.regular },
});
