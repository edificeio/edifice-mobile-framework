import type { ICompetencesReduxState } from './reducer';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return !!userType && entcoreApp.address === '/competences' && [AccountType.Student, AccountType.Relative].includes(userType);
}

export default new NavigableModuleConfig<'competences', ICompetencesReduxState>({
  entcoreScope: ['competences'],

  entcoreTrackingName: 'Competences',
  hasRight: ({ matchingApps }) => matchingApps.some(hasNecessaryRight),
  matchEntcoreApp: 'Competences',
  name: 'competences',
  storageName: 'competences',
});
