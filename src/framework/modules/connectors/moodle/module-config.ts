import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'moodle', null>({
  name: 'moodle',
  entcoreScope: ['cas'],
  matchEntcoreApp: '/moodle',

  displayI18n: 'moodle.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'moodle' },
});