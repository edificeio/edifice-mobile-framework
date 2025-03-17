import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'creativeschool', null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'creativeschool-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/creativeschool.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.includes('edifice'),
  name: 'creativeschool',
  storageName: 'creativeschool',
});
