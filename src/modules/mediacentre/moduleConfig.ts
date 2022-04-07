import { IMediacentre_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'Mediacentre', IMediacentre_State>({
  name: 'Mediacentre',
  displayName: 'mediacentre.mediacentre',
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('MEDIACENTRE'),
  entcoreScope: ['mediacentre'],
  picture: {
    type: 'Image',
    source: require('ASSETS/icons/logo-mediacentre.png'),
  },
  registerAs: 'myAppsModule',
});
