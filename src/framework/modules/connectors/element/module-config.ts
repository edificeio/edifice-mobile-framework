import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const ELEMENT = 'element';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'element-moduleconfig-appname',
  displayPicture: { name: ELEMENT, type: 'Svg' },
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) =>
    matchingApps.length > 0 && matchingApps.some(entcoreApp => entcoreApp.name.toUpperCase().includes('RIOT')),
  matchEntcoreApp: 'Element',
  name: ELEMENT,
  storageName: ELEMENT,
});
