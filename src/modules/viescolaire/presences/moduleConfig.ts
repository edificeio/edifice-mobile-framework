import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';

import { IPresences_State } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp) {
  const userType = getUserSession().user.type;
  return entcoreApp.address === '/presences' && [UserType.Student, UserType.Relative, UserType.Teacher].includes(userType);
}

export default new NavigableModuleConfig<'presences', IPresences_State>({
  name: 'presences',
  entcoreScope: ['presences'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp), // temporary until dashboard redesign

  displayI18n: 'viesco-presences',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'presences' },
});
