import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'nabook', null>({
  displayAs: 'myAppsModule',
  displayI18n: 'nabook-tabname',
  displayPicture: { name: 'nabook', type: 'NamedSvg' },
  entcoreScope: ['nabook'],
  matchEntcoreApp: '/nabook',
  name: 'nabook',
  storageName: 'nabook',
});
