import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsListScreenProps {
  session?: AuthActiveAccount;
}

export interface MailsListScreenNavParams {
  from?: MailsDefaultFolders | MailsFolderInfo;
  idMailToRemove?: string;
  idMailToMarkUnread?: string;
  reload?: boolean;
}

export interface MailsListScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'home'>, MailsListScreenProps {}
