import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'myStage77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('MYSTAGE77'),
  name: 'mystage77',
  storageName: 'mystage77',
});
