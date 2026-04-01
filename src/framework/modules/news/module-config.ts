import type { NewsState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'news', NewsState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  entcoreScope: ['actualites'],

  entcoreTrackingName: 'Actualites',
  matchEntcoreApp: 'Actualites',
  name: 'news',
  storageName: 'news',
});
