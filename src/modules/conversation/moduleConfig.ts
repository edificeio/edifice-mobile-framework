import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IConversation_State } from './reducer';

export default new NavigableModuleConfig<'conversation', IConversation_State>({
  name: 'conversation',
  entcoreScope: ['conversation', 'userbook'],
  matchEntcoreApp: '/conversation/conversation',
  trackingName: 'Messagerie',

  displayI18n: 'conversation.tabName',
  displayAs: 'tabModule',
  displayOrder: 1,
  displayPicture: { type: 'Icon', name: 'messagerie-off' },
  displayPictureFocus: { type: 'Icon', name: 'messagerie-on' },
});
