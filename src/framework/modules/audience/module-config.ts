import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'audience', null>({
  entcoreScope: ['audience'],
  hasRight: () => true,
  matchEntcoreApp: 'Audience',
  name: 'audience',
  storageName: 'audience',
});
