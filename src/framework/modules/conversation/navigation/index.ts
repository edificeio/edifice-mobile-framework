import { ParamListBase } from '@react-navigation/native'

import moduleConfig from '~/framework/modules/conversation/module-config'
import type { ConversationMailContentScreenNavigationParams } from '~/framework/modules/conversation/screens/ConversationMailContent'
import type { ConversationMailListScreenNavigationParams } from '~/framework/modules/conversation/screens/ConversationMailListScreen'
import type { ConversationNewMailScreenNavigationParams } from '~/framework/modules/conversation/screens/ConversationNewMail'

export const conversationRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  mailContent: `${moduleConfig.routeName}/mail-content` as 'mailContent',
  newMail: `${moduleConfig.routeName}/new-mail` as 'newMail',
}
export interface ConversationNavigationParams extends ParamListBase {
  home: ConversationMailListScreenNavigationParams
  mailContent: ConversationMailContentScreenNavigationParams
  newMail: ConversationNewMailScreenNavigationParams
}
