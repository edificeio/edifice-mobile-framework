import type { AppsInfoState } from './types';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'myapps', AppsInfoState>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: () => true,

  matchEntcoreWidget: () => false,
  name: 'myapps',
  storageName: 'myapps',
});
