import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import reducer from './reducer';

export default new NavigableModuleConfig<'mediacentre', ReturnType<typeof reducer>>({
  name: 'mediacentre',
  entcoreScope: ['mediacentre'],
  matchEntcoreApp: '/mediacentre',

  displayI18n: 'mediacentre.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'mediacentre' },
});
