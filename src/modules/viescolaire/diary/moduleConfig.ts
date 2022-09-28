import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';

import { IDiary_State } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp) {
  const userType = getUserSession().user.type;
  return entcoreApp.address === '/diary' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType);
}

export default new NavigableModuleConfig<'diary', IDiary_State>({
  name: 'diary',
  entcoreScope: ['diary'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp), // temporary until dashboard redesign

  displayI18n: 'Homework',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'diary' },
});
