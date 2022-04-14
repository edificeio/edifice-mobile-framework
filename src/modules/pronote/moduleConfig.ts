import { createNavigableModuleConfig } from '~/framework/util/moduleTool';



import { IConnectorState } from './reducers/connector';


export default createNavigableModuleConfig<'pronote', IConnectorState>({
  name: 'pronote',
  displayName: 'Pronote',
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',
  entcoreScope: ['pronote'],
  iconName: 'pronote',
  iconColor: '#763294',
  picture: { type: 'Image', source: require('ASSETS/images/logo-pronote.png') },
  registerAs: 'myAppsModule',
});