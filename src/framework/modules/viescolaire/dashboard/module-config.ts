import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IDashboardReduxState } from './reducer';

function hasViescoApp(entcoreApp: IEntcoreApp): boolean {
  const apps = ['COMPETENCES', 'DIARY', 'EDT', 'PRESENCES'];
  return apps.includes(entcoreApp.name.toUpperCase());
}

export default new NavigableModuleConfig<'dashboard', IDashboardReduxState>({
  name: 'dashboard',
  entcoreScope: ['viescolaire'],
  matchEntcoreApp: entcoreApp => hasViescoApp(entcoreApp),
  hasRight: matchingApps => matchingApps.length > 0 && getSession()?.platform.showVieScolaireDashboard === true,

  displayI18n: 'viesco',
  displayAs: 'tabModule',
  displayOrder: 2,
  displayPicture: { type: 'Icon', name: 'school' },
});
