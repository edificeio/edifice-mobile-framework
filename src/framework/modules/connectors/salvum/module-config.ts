import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const SALVUM = 'salvum';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(SALVUM)),
  matchEntcoreApp: 'Salvum',
  name: SALVUM,
  storageName: SALVUM,
});
