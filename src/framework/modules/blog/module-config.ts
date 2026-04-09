import type reducer from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'blog', ReturnType<typeof reducer>>({
  entcoreScope: ['blog'],
  entcoreTrackingName: 'Blog',
  matchEntcoreApp: 'Blog',
  name: 'blog',
  storageName: 'blog',
});
