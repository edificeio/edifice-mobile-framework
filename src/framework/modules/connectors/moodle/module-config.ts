import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const MOODLE = 'moodle';

export default new NavigableModuleConfig<string, null>({
  entcoreScope: ['cas'],
  matchEntcoreApp: 'Moodle',
  name: MOODLE,
  storageName: MOODLE,
});
