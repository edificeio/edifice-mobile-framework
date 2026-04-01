import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const PEERTUBE = 'peertube';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(PEERTUBE)),
  matchEntcoreApp: 'Peertube',
  name: PEERTUBE,
  storageName: PEERTUBE,
});
