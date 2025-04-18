import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYCLASSE77 = 'myclasse77';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'myClasse77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toLowerCase().includes(MYCLASSE77),
  name: MYCLASSE77,
  storageName: MYCLASSE77,
});
