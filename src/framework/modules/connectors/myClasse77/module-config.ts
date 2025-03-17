import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'myClasse77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('MYCLASSE77'),
  name: 'myClasse77',
  storageName: 'myClasse77',
});
