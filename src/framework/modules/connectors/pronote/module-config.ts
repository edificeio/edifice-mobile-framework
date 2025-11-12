import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote-connector', null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'pronote',
  displayPicture: { source: require('ASSETS/images/logo-pronote.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.address.toLowerCase().includes('pronote'),
  name: 'pronote-connector',
  storageName: 'pronote-connector',
});
