import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const WEKAN = 'wekan';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(WEKAN)),
  matchEntcoreApp: 'Wekan',
  name: WEKAN,
  storageName: WEKAN,
});
