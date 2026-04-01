import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'mails', null>({
  displayAs: ModuleType.TAB_MODULE,
  displayOrder: 1,
  displayPictureBlur: { name: 'messagerie-off', type: 'Icon' },
  displayPictureFocus: { name: 'messagerie-on', type: 'Icon' },
  entcoreScope: ['conversation', 'userbook', 'communication'],
  entcoreTrackingName: 'Conversation',
  fileManager: {
    attachments: {
      allow: ['image', 'video', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  hasRight: ({ matchingApps }) =>
    matchingApps.some(
      entcoreApp => entcoreApp.address === '/conversation/conversation' || entcoreApp.address.includes('/auth/carbonio/preauth'),
    ),
  matchEntcoreApp: 'Messagerie',
  name: 'mails',
  storageName: 'mails',
  tabDisplayName: 'mails-tabname',
  testID: 'tabbar-messages',
  trackingName: 'Mails',
});
