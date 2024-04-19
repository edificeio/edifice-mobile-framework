import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'collaborativewall', null>({
  name: 'collaborativewall',
  entcoreScope: ['collaborativewall'],
  matchEntcoreApp: '/collaborativewall',
  storageName: 'collaborativewall',

  displayI18n: 'collaborativewall-tabname',
});
