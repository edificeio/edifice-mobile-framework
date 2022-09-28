import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';

import { ICompetences_State } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp) {
  const userType = getUserSession().user.type;
  return entcoreApp.address === '/competences' && [UserType.Student, UserType.Relative].includes(userType);
}

export default new NavigableModuleConfig<'competences', ICompetences_State>({
  name: 'competences',
  entcoreScope: ['competences'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp), // temporary until dashboard redesign

  displayI18n: 'viesco-tests',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'competences' },
});
