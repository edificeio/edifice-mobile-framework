import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const SALVUM = 'salvum';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'salvum-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/salvum.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toLowerCase().includes(SALVUM),
  name: SALVUM,
  storageName: SALVUM,
});
