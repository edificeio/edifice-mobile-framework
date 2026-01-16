import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const SALVUM = 'salvum';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'salvum-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/salvum.png'), type: 'Image' },
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) =>
    matchingApps.length > 0 && matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(SALVUM)),
  matchEntcoreApp: 'Salvum',
  name: SALVUM,
  storageName: SALVUM,
});
