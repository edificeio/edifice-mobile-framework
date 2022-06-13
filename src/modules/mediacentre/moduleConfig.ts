import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IMediacentre_State } from './reducer';

export default new NavigableModuleConfig<'Mediacentre', IMediacentre_State>({
  name: 'Mediacentre',
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',

  displayI18n: 'mediacentre.tabName',
  displayAs: 'myAppsModule',
  displayPicture: {
    type: 'NamedSvg',
    name: 'mediacentre',
  },
});
