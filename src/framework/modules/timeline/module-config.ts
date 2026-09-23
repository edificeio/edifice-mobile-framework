import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'timeline', undefined>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 0,
  displayPictureBlur: { name: 'nouveautes-off', type: 'Icon' },
  displayPictureFocus: { name: 'nouveautes-on', type: 'Icon' },
  entcoreScope: ['timeline', 'userbook'],
  entcoreTrackingName: 'Timeline',
  hasRight: () => true,
  matchEntcoreApp: 'Timeline',
  name: 'timeline',
  // The timeline is always displayed
  storageName: 'timeline',
  testID: 'timeline-home',
});
