import { AuthActiveAccount } from '~/framework/modules/auth/model';

export const recallMessageRight = 'org.entcore.conversation.controllers.ApiController|recallMessage';

export const getRecallMessageRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions?.some(a => a.name === recallMessageRight) ?? false;
};

export const noReplyRight = 'org.entcore.conversation.controllers.ConversationController|noReply';

export const getNoReplyRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions?.some(a => a.name === noReplyRight) ?? false;
};

export const carbonioMailRight = 'org.entcore.auth.controllers.CarbonioPreauthController|preauth';

export const getMailCarbonioRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions?.some(a => a.name === carbonioMailRight) ?? false;
};
