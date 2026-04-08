import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote-connector', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: ['pronote'],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.casType === 'PronoteRegisteredService'),
  matchEntcoreApp: 'Pronote',
  name: 'pronote-connector',
  storageName: 'pronote-connector',
});
