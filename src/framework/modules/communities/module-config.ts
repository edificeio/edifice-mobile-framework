import { CommunitiesStore } from './store';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'communities', CommunitiesStore>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 2,
  displayPictureBlur: { name: 'communities-outline', type: 'Svg' },
  displayPictureFocus: { name: 'communities-fill', type: 'Svg' },
  entcoreScope: ['communities'],
  entcoreTrackingName: 'Communities',
  matchEntcoreApp: 'Communities',
  name: 'communities',
  storageName: 'communities',
});
