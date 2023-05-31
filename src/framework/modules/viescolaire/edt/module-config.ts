import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IEdtReduxState } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return !!userType && entcoreApp.address === '/edt' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType);
}

export default new NavigableModuleConfig<'edt', IEdtReduxState>({
  name: 'edt',
  entcoreScope: ['edt'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'viesco-timetable',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'edt' },
});
