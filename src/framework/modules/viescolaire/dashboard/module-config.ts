import type { IDashboardReduxState } from './reducer';

import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasViescoApp(entcoreApp: IEntcoreApp): boolean {
  const apps = ['COMPETENCES', 'DIARY', 'EDT', 'PRESENCES'];
  return apps.includes(entcoreApp.name.toUpperCase());
}

export default new NavigableModuleConfig<'dashboard', IDashboardReduxState>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 2,
  entcoreScope: ['viescolaire'],
  hasRight: ({ matchingApps, session }) => session.platform.showVieScolaireDashboard === true && matchingApps.some(hasViescoApp),
  matchEntcoreApp: 'Dashboard',
  name: 'dashboard',
  storageName: 'dashboard',
});
