import type { PresencesReduxState } from './reducer';

import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/presences' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'presences', PresencesReduxState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayColor: theme.apps.presences.accentColors,
  displayI18n: 'presences-moduleconfig-appname',
  displayPicture: theme.apps.presences.icon,
  entcoreScope: ['presences'],

  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),
  name: 'presences',
  storageName: 'presences',
});
