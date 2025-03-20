import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MYSTAGE77 = 'mystage77';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'myStage77-moduleconfig-appname',
  displayPicture: { source: require('ASSETS/icons/moduleIcons/connector77.png'), type: 'Image' },
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.address.toLowerCase().includes(MYSTAGE77),
  name: MYSTAGE77,
  storageName: MYSTAGE77,
});
