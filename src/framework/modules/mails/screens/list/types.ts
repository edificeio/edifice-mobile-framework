import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsListScreenProps {
  // @scaffolder add props here
}

export interface MailsListScreenNavParams {
  // @scaffolder add nav params here
}

export interface MailsListScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'home'>, MailsListScreenProps {
  // @scaffolder add HOC props here
}
