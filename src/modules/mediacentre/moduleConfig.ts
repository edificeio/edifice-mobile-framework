import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

import { IMediacentre_State } from './reducer';

export default createNavigableModuleConfig<'Mediacentre', IMediacentre_State>({
  name: 'Mediacentre',
  displayName: 'mediacentre.mediacentre',
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('MEDIACENTRE'),
  entcoreScope: ['mediacentre'],
  picture: {
    type: 'Image',
<<<<<<< HEAD
    source: require('ASSETS/icons/logo-mediacentre.png'),
=======
    source: require('ASSETS/images/logo-mediacentre.png'),
>>>>>>> dev/1.7.4
  },
  registerAs: 'myAppsModule',
});
