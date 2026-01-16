import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote-connector', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'pronote',
  displayPicture: { source: require('ASSETS/images/logo-pronote.png'), type: 'Image' },
  entcoreScope: ['pronote'],
  hasRight: ({ matchingApps }) =>
    matchingApps.length > 0 && matchingApps.some(entcoreApp => entcoreApp.casType === 'PronoteRegisteredService'),
  matchEntcoreApp: 'Pronote',
  name: 'pronote-connector',
  storageName: 'pronote-connector',
});
