import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

/**
 * All that is left of the timeline's identity. Its state moved to the home module with the
 * notifications, but its navigator, routes and notification handler still use this name.
 * `storageName` is only kept to satisfy the type.
 */
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
