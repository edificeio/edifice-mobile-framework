import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { INewsState } from './reducer';

export default new NavigableModuleConfig<'news', INewsState>({
  name: 'news',
  entcoreScope: ['actualites'],
  matchEntcoreApp: '/actualites',
  displayI18n: 'newsDetailsScreen.tabName',
});
