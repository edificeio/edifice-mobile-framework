import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYSTAGE77 = 'mystage77';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['cas', 'sso'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.address.toLowerCase().includes(MYSTAGE77)),
  matchEntcoreApp: 'MyStage77',
  name: MYSTAGE77,
  storageName: MYSTAGE77,
});
