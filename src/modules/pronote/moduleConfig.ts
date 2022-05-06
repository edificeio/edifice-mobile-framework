import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IConnectorState } from './reducers/connector';

export default new NavigableModuleConfig<'pronote', IConnectorState>({
  name: 'pronote',
  entcoreScope: ['pronote'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',

  displayI18n: 'Pronote',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Image', source: require('ASSETS/images/logo-pronote.png') },
});
