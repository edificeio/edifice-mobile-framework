import type { MediacentreReduxState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, MediacentreReduxState>({
  entcoreScope: ['mediacentre'],
  entcoreTrackingName: 'Mediacentre',
  matchEntcoreApp: 'Mediacentre',
  name: 'mediacentre',
  storageName: 'mediacentre',
});
