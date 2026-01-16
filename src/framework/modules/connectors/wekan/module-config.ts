import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const WEKAN = 'wekan';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'wekan-moduleconfig-appname',
  displayPicture: { name: WEKAN, type: 'Svg' },
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(WEKAN)),
  matchEntcoreApp: 'Wekan',
  name: WEKAN,
  storageName: WEKAN,
});
