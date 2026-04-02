import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'debug', null>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: 'debug',
  name: 'debug',
  storageName: 'debug',
});
