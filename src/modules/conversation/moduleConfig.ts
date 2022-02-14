import { IConversation_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'conversation', IConversation_State>({
  name: 'conversation',
  displayName: 'conversation.tabName',
  matchEntcoreApp: '/conversation/conversation',
  entcoreScope: ['conversation', 'userbook'],
  iconName: 'messagerie',
  trackingName: 'Messagerie',
  registerAs: 'tabModule',
  registerOrder: 1,
});
