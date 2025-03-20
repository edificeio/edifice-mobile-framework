import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const ELEMENT = 'element';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'element-moduleconfig-appname',
  displayPicture: { name: ELEMENT, type: 'NamedSvg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('RIOT'),
  name: ELEMENT,
  storageName: ELEMENT,
});
