import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IConnectorState } from './reducers/connector';

const regexp = /la[- ]+vie[- ]+scolaire/i;

function hasConnectorModule(entcoreApp) {
  const isModule = entcoreApp.address && (entcoreApp.address.toUpperCase().includes('LVS') || regexp.test(entcoreApp.address));
  if (isModule && isModule !== -1) return true;
  return false;
}

export default new NavigableModuleConfig<'lvs', IConnectorState>({
  name: 'lvs',
  entcoreScope: ['lvs'],
  matchEntcoreApp: entcoreApp => hasConnectorModule(entcoreApp),

  displayI18n: 'LVS',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Icon', name: 'lvs', color: '#299cc8' },
});
