import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const CREATIVESCHOOL = 'creativeschool';

export default new NavigableModuleConfig<'creativeschool', null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'creativeschool-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/creativeschool.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toLocaleLowerCase().includes('edifice'),
  name: CREATIVESCHOOL,
  storageName: CREATIVESCHOOL,
});
