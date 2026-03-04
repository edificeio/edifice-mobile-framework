import type { AppsInfoState } from './types';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'myapps', AppsInfoState>({
  entcoreScope: [],
  hasRight: () => true,
  matchEntcoreApp: 'myapps',

  matchEntcoreWidget: () => false,
  name: 'myapps',
  storageName: 'myapps',
});
