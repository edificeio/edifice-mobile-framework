import type { ICompetencesReduxState } from './reducer';

import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return !!userType && entcoreApp.address === '/competences' && [AccountType.Student, AccountType.Relative].includes(userType);
}

export default new NavigableModuleConfig<'competences', ICompetencesReduxState>({
  displayAs: ModuleType.MYAPPS_SECONDARY_MODULE,
  displayColor: theme.apps.competences.accentColors,
  displayI18n: 'competences-moduleconfig-appname',
  displayPicture: theme.apps.competences.icon,
  entcoreScope: ['competences'],

  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),
  name: 'competences',
  storageName: 'competences',
});
