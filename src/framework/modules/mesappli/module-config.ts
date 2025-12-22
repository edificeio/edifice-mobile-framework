import type { AppsInfoState } from './types';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'mesappli', AppsInfoState>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: () => true,

  matchEntcoreWidget: () => false,
  name: 'mesappli',
  storageName: 'mesappli',
});
