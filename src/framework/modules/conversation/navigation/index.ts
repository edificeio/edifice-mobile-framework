import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
// import type { ConversationOtherScreenNavParams } from '../screens/other';
import type { ConversationMailListScreenNavigationParams } from '../screens/ConversationMailListScreen';

export const conversationRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  // other: `${moduleConfig.routeName}/other` as 'other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface ConversationNavigationParams extends ParamListBase {
  home: ConversationMailListScreenNavigationParams;
  // other: ConversationOtherScreenNavParams;
}
