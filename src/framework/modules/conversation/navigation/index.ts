import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
// import type { ConversationHomeScreenNavParams } from '../screens/home';
// import type { ConversationOtherScreenNavParams } from '../screens/other';

export const conversationRouteNames = {
  // home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
  // other: `${moduleConfig.routeName}/other` as 'other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface ConversationNavigationParams extends ParamListBase {
  // home: ConversationHomeScreenNavParams;
  // other: ConversationOtherScreenNavParams;
}
