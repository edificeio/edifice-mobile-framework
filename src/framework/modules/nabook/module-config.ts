import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['nabook'],
  entcoreTrackingName: 'Nabook',
  matchEntcoreApp: 'nabook',
  name: 'nabook',
  storageName: 'nabook',
});
