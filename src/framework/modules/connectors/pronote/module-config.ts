import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote-connector', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'pronote',
  displayPicture: { source: require('ASSETS/images/logo-pronote.png'), type: 'Image' },
  entcoreScope: ['pronote'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',
  name: 'pronote-connector',
  storageName: 'pronote-connector',
});
