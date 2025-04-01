import type { MediacentreReduxState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, MediacentreReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayI18n: 'mediacentre-moduleconfig-appname',
  displayPicture: { name: 'mediacentre', type: 'Svg' },
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',
  name: 'mediacentre',
  storageName: 'mediacentre',
});
