import type { IConversationState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'conversation', IConversationState>({
  displayI18n: 'conversation-moduleconfig-tabname',

  entcoreScope: ['conversation', 'userbook'],
  matchEntcoreApp: '/conversation/conversation',
  name: 'conversation',
  storageName: 'conversation',
  testID: 'tabbar-messages',
  trackingName: 'Messagerie',
});
