import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const CREATIVESCHOOL = 'creativeschool';

export default new NavigableModuleConfig<'creativeschool', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: ['cas'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toLocaleLowerCase().includes('edifice')),
  matchEntcoreApp: 'Creativeschool',
  name: CREATIVESCHOOL,
  storageName: CREATIVESCHOOL,
});
