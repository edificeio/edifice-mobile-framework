import type reducer from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'support', ReturnType<typeof reducer>>({
  displayAs: 'myAppsSecondaryModule',
  displayColor: theme.apps.support.accentColors,
  displayI18n: 'support-appname',
  displayPicture: theme.apps.support.icon,
  entcoreScope: ['support'],

  matchEntcoreApp: '/support',
  name: 'support',
  storageName: 'support',
});
