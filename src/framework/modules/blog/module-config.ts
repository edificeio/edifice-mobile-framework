import type reducer from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  displayAs: ModuleType.MYAPPS_MODULE,
  entcoreScope: ['blog'],
  entcoreTrackingName: 'Blog',
  matchEntcoreApp: 'Blog',
  name: 'blog',
  storageName: 'blog',
});
