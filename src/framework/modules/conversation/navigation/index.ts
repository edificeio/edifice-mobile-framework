import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { ConversationMailContentScreenNavigationParams } from '../screens/ConversationMailContent';
import type { ConversationMailListScreenNavigationParams } from '../screens/ConversationMailListScreen';
import type { ConversationNewMailScreenNavigationParams } from '../screens/ConversationNewMail';

export const conversationRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  mailContent: `${moduleConfig.routeName}/mail-content` as 'mailContent',
  newMail: `${moduleConfig.routeName}/new-mail` as 'newMail',
};
export interface ConversationNavigationParams extends ParamListBase {
  home: ConversationMailListScreenNavigationParams;
  mailContent: ConversationMailContentScreenNavigationParams;
  newMail: ConversationNewMailScreenNavigationParams;
}
