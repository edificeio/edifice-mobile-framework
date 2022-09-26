import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ICompetences_State } from './reducer';

export default new NavigableModuleConfig<'competences', ICompetences_State>({
  name: 'competences',
  entcoreScope: ['competences'],
  matchEntcoreApp: () => false, // temporary until dashboard redesign

  displayI18n: 'viesco-tests',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'competences' },
});
