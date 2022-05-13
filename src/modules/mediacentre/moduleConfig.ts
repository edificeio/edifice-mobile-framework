import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IMediacentre_State } from './reducer';

export default new NavigableModuleConfig<'Mediacentre', IMediacentre_State>({
  name: 'Mediacentre',
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('MEDIACENTRE'),

  displayI18n: 'mediacentre.mediacentre',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Image', source: require('ASSETS/images/logo-mediacentre.png') },
});
