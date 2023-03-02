import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { ConversationMailListScreenNavigationParams } from '../screens/ConversationMailListScreen';
import type { ConversationNewMailScreenNavigationParams } from '../screens/NewMail';

export const conversationRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  newMail: `${moduleConfig.routeName}/new-mail` as 'newMail',
};
export interface ConversationNavigationParams extends ParamListBase {
  home: ConversationMailListScreenNavigationParams;
  newMail: ConversationNewMailScreenNavigationParams;
}
