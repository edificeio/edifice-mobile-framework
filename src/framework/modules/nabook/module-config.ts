import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_MODULE,
  entcoreScope: ['nabook'],
  entcoreTrackingName: 'Nabook',
  matchEntcoreApp: 'nabook',
  name: 'nabook',
  storageName: 'nabook',
});
