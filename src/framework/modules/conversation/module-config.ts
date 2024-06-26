import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { IConversationState } from './reducer';

export default new NavigableModuleConfig<'conversation', IConversationState>({
  name: 'conversation',
  entcoreScope: ['conversation', 'userbook'],
  matchEntcoreApp: '/conversation/conversation',
  trackingName: 'Messagerie',
  storageName: 'conversation',

  displayI18n: 'conversation-moduleconfig-tabname',
  displayAs: 'tabModule',
  displayOrder: 1,
  displayPicture: { type: 'Icon', name: 'messagerie-off' },
  displayPictureFocus: { type: 'Icon', name: 'messagerie-on' },
  testID: 'tabbar-messages',
});
