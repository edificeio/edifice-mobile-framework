import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYCLASSE77 = 'myclasse77';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['cas', 'sso'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLowerCase().includes(MYCLASSE77)),
  matchEntcoreApp: 'MyClasse77',
  name: MYCLASSE77,
  storageName: MYCLASSE77,
});
