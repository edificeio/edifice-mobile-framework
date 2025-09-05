import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'debug', null>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: () => false,
  name: 'debug',
  storageName: 'debug',
});
