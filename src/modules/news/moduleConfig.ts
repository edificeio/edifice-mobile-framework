import { INews_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'news', INews_State>({
  name: 'news',
  displayName: 'news.tabName',
  matchEntcoreApp: '/actualites',
  entcoreScope: ['actualites'],
});
