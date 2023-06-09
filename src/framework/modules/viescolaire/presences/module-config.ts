import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IPresencesReduxState } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType && entcoreApp.address === '/presences' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'presences', IPresencesReduxState>({
  name: 'presences',
  entcoreScope: ['presences'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'presences-moduleconfig-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'presences' },
});
