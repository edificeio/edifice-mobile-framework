import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsSignatureScreenProps {}

export interface MailsSignatureScreenNavParams {}

export interface MailsSignatureScreenPrivateProps
  extends NativeStackScreenProps<MailsNavigationParams, 'signature'>,
    MailsSignatureScreenProps {}
