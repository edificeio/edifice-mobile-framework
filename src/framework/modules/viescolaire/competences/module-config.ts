import { assertSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { ICompetencesReduxState } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = assertSession().user.type;
  return entcoreApp.address === '/competences' && [UserType.Student, UserType.Relative].includes(userType);
}

export default new NavigableModuleConfig<'competences', ICompetencesReduxState>({
  name: 'competences',
  entcoreScope: ['competences'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'viesco-tests',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'competences' },
});
