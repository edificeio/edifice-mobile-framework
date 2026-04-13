import type { NewsState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'news', NewsState>({
  entcoreScope: ['actualites'],

  entcoreTrackingName: 'Actualites',
  matchEntcoreApp: 'Actualites',
  name: 'news',
  storageName: 'news',
});
