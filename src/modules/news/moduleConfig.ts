import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { INews_State } from './reducer';

export default new NavigableModuleConfig<'news', INews_State>({
  name: 'news',
  entcoreScope: ['actualites'],
  matchEntcoreApp: '/actualites',
  displayI18n: 'newsDetailsScreen.title',
});
