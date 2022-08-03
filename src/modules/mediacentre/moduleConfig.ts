import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IMediacentre_State } from './reducer';

export default new NavigableModuleConfig<'mediacentre', IMediacentre_State>({
  name: 'mediacentre',
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',

  displayI18n: 'mediacentre.tabName',
  displayAs: 'myAppsModule',
  displayPicture: {
    type: 'NamedSvg',
    name: 'mediacentre',
  },
});
