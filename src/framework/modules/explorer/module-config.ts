import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'explorer', null>({
  entcoreScope: ['explorer'],
  hasRight: () => true,
  matchEntcoreApp: 'Explorer',
  name: 'explorer',
  storageName: 'explorer',
});
