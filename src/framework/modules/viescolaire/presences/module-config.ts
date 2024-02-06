import theme from '~/app/theme';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { PresencesReduxState } from './reducer';
import { AccountType } from '../../auth/model';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/presences' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'presences', PresencesReduxState>({
  name: 'presences',
  entcoreScope: ['presences'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'presences-moduleconfig-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'presences', fill: theme.palette.complementary.yellow.regular },
});
