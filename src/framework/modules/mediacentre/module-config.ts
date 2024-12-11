import type { MediacentreReduxState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'mediacentre', MediacentreReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayI18n: 'mediacentre-moduleconfig-appname',
  displayPicture: { name: 'mediacentre', type: 'NamedSvg' },
  entcoreScope: ['mediacentre'],

  matchEntcoreApp: '/mediacentre',
  name: 'mediacentre',
  storageName: 'mediacentre',
});
