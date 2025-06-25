import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const NABOOK = 'nabook';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsModule',
  displayI18n: 'nabook-tabname',
  displayPicture: { name: NABOOK, type: 'Svg' },
  entcoreScope: [NABOOK],
  matchEntcoreApp: '/nabook',
  name: NABOOK,
  storageName: NABOOK,
});
