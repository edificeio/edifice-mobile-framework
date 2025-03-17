import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'salvum-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/salvum.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('SALVUM'),
  name: 'salvum',
  storageName: 'salvum',
});
