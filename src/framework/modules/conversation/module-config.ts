import type { IConversationState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'conversation', IConversationState>({
  displayAs: 'tabModule',
  displayI18n: 'conversation-moduleconfig-tabname',
  displayOrder: 1,
  displayPicture: { name: 'messagerie-off', type: 'Icon' },
  displayPictureFocus: { name: 'messagerie-on', type: 'Icon' },

  entcoreScope: ['conversation', 'userbook'],
  matchEntcoreApp: '/conversation/conversation',
  name: 'conversation',
  storageName: 'conversation',
  testID: 'tabbar-messages',
  trackingName: 'Messagerie',
});
