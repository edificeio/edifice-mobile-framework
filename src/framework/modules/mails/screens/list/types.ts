import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsListScreenProps {
  session?: AuthActiveAccount;
}

export interface MailsListScreenNavParams {}

export interface MailsListScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'home'>, MailsListScreenProps {}
