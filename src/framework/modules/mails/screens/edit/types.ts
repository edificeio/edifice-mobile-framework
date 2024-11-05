import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsEditScreenProps {
  // @scaffolder add props here
}

export interface MailsEditScreenNavParams {
  // @scaffolder add nav params here
}

export interface MailsEditScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'edit'>, MailsEditScreenProps {
  // @scaffolder add HOC props here
}
