import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'splashads', null>({
  entcoreScope: ['splashads'],
  hasRight: () => true,
  matchEntcoreApp: null,
  name: 'splashads',
  storageName: 'splashads',
});
