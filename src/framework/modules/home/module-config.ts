import { ModuleConfig } from '~/framework/util/moduleTool';

import type { TimelineState } from './reducer';

/**
 * Identity of the notifications module.
 * The reducer, actions and storage keys all use this name.
 */
export default new ModuleConfig<'home', TimelineState>({
  entcoreScope: ['timeline', 'userbook'],
  entcoreTrackingName: 'Timeline',
  hasRight: () => true,
  matchEntcoreApp: 'Timeline',
  name: 'home',
  // Todo: rename to 'home' once the timeline module is gone, with a migration. It is kept as is so
  // the preferences already saved on the devices are still found where the app looks for them.
  storageName: 'timeline',
});
