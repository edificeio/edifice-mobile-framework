import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const MOODLE = 'moodle';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'moodle-moduleconfig-appname',
  displayPicture: { name: MOODLE, type: 'Svg' },
  entcoreScope: ['cas'],
  matchEntcoreApp: `/${MOODLE}`,
  name: MOODLE,
  storageName: MOODLE,
});
