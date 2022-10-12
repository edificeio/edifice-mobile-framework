import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IDashboard_State } from './reducer';

function hasViescoApp(entcoreApp: IEntcoreApp) {
  const viescoApps = ['COMPETENCES', 'DIARY', 'EDT', 'PRESENCES'];
  return viescoApps.includes(entcoreApp.name.toUpperCase());
}

export default new NavigableModuleConfig<'viescolaire', IDashboard_State>({
  name: 'viescolaire',
  entcoreScope: ['viescolaire'],
  matchEntcoreApp: entcoreApp => hasViescoApp(entcoreApp),
  hasRight: matchingApps => matchingApps.length > 0 && (DEPRECATED_getCurrentPlatform()?.showVieScolaireDashboard ?? false),

  displayI18n: 'viesco',
  displayAs: 'tabModule',
  displayOrder: 2,
  displayPicture: { type: 'Icon', name: 'school' },
});
