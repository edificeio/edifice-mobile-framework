import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYSTAGE77 = 'mystage77';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'myStage77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) =>
    matchingApps.length > 0 && matchingApps.some(entcoreApp => entcoreApp.address.toLowerCase().includes(MYSTAGE77)),
  matchEntcoreApp: 'MyStage77',
  name: MYSTAGE77,
  storageName: MYSTAGE77,
});
