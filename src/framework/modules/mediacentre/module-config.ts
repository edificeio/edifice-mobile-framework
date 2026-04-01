import type { MediacentreReduxState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, MediacentreReduxState>({
  displayAs: ModuleType.MYAPPS_SECONDARY_MODULE,
  entcoreScope: ['mediacentre'],
  entcoreTrackingName: 'Mediacentre',
  matchEntcoreApp: 'Mediacentre',
  name: 'mediacentre',
  storageName: 'mediacentre',
});
