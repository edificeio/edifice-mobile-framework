import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'wekan-moduleconfig-appname',
  displayPicture: { name: 'wekan', type: 'NamedSvg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('WEKAN'),
  name: 'wekan',
  storageName: 'wekan',
});
