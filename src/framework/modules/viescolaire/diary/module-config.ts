import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IDiaryReduxState } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType && entcoreApp.address === '/diary' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'diary', IDiaryReduxState>({
  name: 'diary',
  entcoreScope: ['diary'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'Homework',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'diary' },
});
