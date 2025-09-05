import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsDetailsOriginalContentScreenProps {}

export interface MailsDetailsOriginalContentScreenNavParams {
  id: string;
}

export interface MailsDetailsOriginalContentScreenPrivateProps
  extends NativeStackScreenProps<MailsNavigationParams, 'originalContent'>,
    MailsDetailsOriginalContentScreenProps {}
