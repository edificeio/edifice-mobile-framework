import { ModuleConfig } from '~/framework/util/moduleTool';

import { INews_State } from './reducer';

export default new ModuleConfig<'news', INews_State>({
  name: 'news',
  entcoreScope: ['actualites'],
  matchEntcoreApp: '/actualites',
});
