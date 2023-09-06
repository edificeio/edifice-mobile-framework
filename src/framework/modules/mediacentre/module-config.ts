import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IMediacentreReduxState } from './reducer';

export default new NavigableModuleConfig<'mediacentre', IMediacentreReduxState>({
  name: 'mediacentre',
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',

  displayI18n: 'mediacentre-moduleconfig-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'mediacentre' },
});
