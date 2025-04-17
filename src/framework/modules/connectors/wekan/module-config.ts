import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const WEKAN = 'wekan';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'wekan-moduleconfig-appname',
  displayPicture: { name: WEKAN, type: 'Svg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toLowerCase().includes(WEKAN),
  name: WEKAN,
  storageName: WEKAN,
});
