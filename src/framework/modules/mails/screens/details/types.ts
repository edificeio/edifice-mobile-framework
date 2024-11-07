import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsDetailsScreenProps {
  // @scaffolder add props here
}

export interface MailsDetailsScreenNavParams {
  // @scaffolder add nav params here
}

export interface MailsDetailsScreenPrivateProps
  extends NativeStackScreenProps<MailsNavigationParams, 'details'>,
    MailsDetailsScreenProps {
  // @scaffolder add HOC props here
}
