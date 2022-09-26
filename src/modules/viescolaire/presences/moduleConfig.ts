import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IPresences_State } from './reducer';

export default new NavigableModuleConfig<'presences', IPresences_State>({
  name: 'presences',
  entcoreScope: ['presences'],
  matchEntcoreApp: '/presences', // temporary until dashboard redesign

  displayI18n: 'viesco-presences',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'presences' },
});
