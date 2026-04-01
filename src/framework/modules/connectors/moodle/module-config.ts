import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const MOODLE = 'moodle';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: ['cas'],
  matchEntcoreApp: 'Moodle',
  name: MOODLE,
  storageName: MOODLE,
});
