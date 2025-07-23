import type { IMediacentreReduxState } from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, IMediacentreReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayColor: theme.apps.mediacentre.accentColors,
  displayI18n: 'mediacentre-moduleconfig-appname',
  displayPicture: theme.apps.mediacentre.icon,
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',
  name: 'mediacentre',
  storageName: 'mediacentre',
});
