import { IConnectorState } from './reducers/connector';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'pronote', IConnectorState>({
  name: 'pronote',
  displayName: 'Pronote',
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',
  entcoreScope: ['pronote'],
  iconName: 'pronote',
  iconColor: '#763294',
  registerAs: 'myAppsModule',
});
