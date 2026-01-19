import { AuthActiveAccount } from '~/framework/modules/auth/model';

export const recallMessageRight = 'org.entcore.conversation.controllers.ApiController|recallMessage';

export const getRecallMessageRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === recallMessageRight);
};

export const noReplyRight = 'org.entcore.conversation.controllers.ConversationController|noReply';

export const getNoReplyRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === noReplyRight);
};
