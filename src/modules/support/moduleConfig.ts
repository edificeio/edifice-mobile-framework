import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ISupport_State } from './reducer';

export default new NavigableModuleConfig<'support', ISupport_State>({
  name: 'support',
  entcoreScope: ['support'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('SUPPORT'),

  displayI18n: 'support',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'support' },
});
