import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MOODLE = 'moodle';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsConnector',
  displayI18n: 'moodle-moduleconfig-appname',
  displayPicture: { name: MOODLE, type: 'dSvg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: `/${MOODLE}`,
  name: MOODLE,
  storageName: MOODLE,
});
