import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IViesco_State } from './reducer';

const ViescoApps = ['PRESENCES', 'INCIDENTS', 'DIARY'];

function hasViescoModule(entcoreApp: IEntcoreApp) {
  const isModule = ViescoApps.findIndex(app => app === entcoreApp.name.toUpperCase());
  if (isModule && isModule !== -1) return true;
  return false;
}

export default new NavigableModuleConfig<'viescolaire', IViesco_State>({
  name: 'viescolaire',
  entcoreScope: ['viescolaire'],
  matchEntcoreApp: entcoreApp => hasViescoModule(entcoreApp),

  displayI18n: 'viesco',
  displayAs: 'tabModule',
  displayOrder: 2,
  displayPicture: { type: 'Icon', name: 'school' },
});
