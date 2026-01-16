import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYCLASSE77 = 'myclasse77';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'myClasse77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas', 'sso'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(MYCLASSE77)),
  matchEntcoreApp: 'MyClasse77',
  name: MYCLASSE77,
  storageName: MYCLASSE77,
});
