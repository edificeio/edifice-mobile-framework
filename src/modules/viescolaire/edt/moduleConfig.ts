import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';

import { IEdt_State } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp) {
  const userType = getUserSession().user.type;
  return entcoreApp.address === '/edt' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType);
}

export default new NavigableModuleConfig<'edt', IEdt_State>({
  name: 'edt',
  entcoreScope: ['edt'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp), // temporary until dashboard redesign

  displayI18n: 'viesco-timetable',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'edt' },
});
