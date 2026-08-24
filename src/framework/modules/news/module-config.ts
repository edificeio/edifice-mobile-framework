import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { NewsState } from './reducer';
import { getNewsRights } from './rights';

export default new NavigableModuleConfig<'news', NewsState>({
  entcoreScope: ['actualites'],

  entcoreTrackingName: 'Actualites',
  hasRight: ({ matchingApps, session }) => matchingApps.length > 0 && getNewsRights(session).view,
  matchEntcoreApp: 'Actualites',
  name: 'news',
  storageName: 'news',
});
