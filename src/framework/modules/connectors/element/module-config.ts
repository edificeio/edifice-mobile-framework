import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const ELEMENT = 'element';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toUpperCase().includes('RIOT')),
  matchEntcoreApp: 'Element',
  name: ELEMENT,
  storageName: ELEMENT,
});
