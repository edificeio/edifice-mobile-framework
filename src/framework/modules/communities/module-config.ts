import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { CommunitiesStore } from './store';

export const COLLECT_API = { apiName: 'collect/api' };

export default new NavigableModuleConfig<'communities', CommunitiesStore>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 2,
  displayPictureBlur: { name: 'communities-outline', type: 'Svg' },
  displayPictureFocus: { name: 'communities-fill', type: 'Svg' },
  entcoreScope: ['communities', 'collect'],
  entcoreTrackingName: 'Communities',
  matchEntcoreApp: 'Communities',
  name: 'communities',
  storageName: 'communities',
  testID: 'tabbar-communities',
});
