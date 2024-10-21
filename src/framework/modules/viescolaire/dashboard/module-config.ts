import type { IDashboardReduxState } from './reducer';

import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasViescoApp(entcoreApp: IEntcoreApp): boolean {
  const apps = ['COMPETENCES', 'DIARY', 'EDT', 'PRESENCES'];
  return apps.includes(entcoreApp.name.toUpperCase());
}

export default new NavigableModuleConfig<'dashboard', IDashboardReduxState>({
  displayAs: 'tabModule',
  displayI18n: 'dashboard-moduleconfig-tabname',
  displayOrder: 2,
  displayPicture: { name: 'school', type: 'Icon' },
  entcoreScope: ['viescolaire'],

  hasRight: matchingApps => matchingApps.length > 0 && getSession()?.platform.showVieScolaireDashboard === true,
  matchEntcoreApp: entcoreApp => hasViescoApp(entcoreApp),
  name: 'dashboard',
  storageName: 'dashboard',
});
