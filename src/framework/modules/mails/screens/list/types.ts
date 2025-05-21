import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsListScreenProps {
  session?: AuthActiveAccount;
}

export interface MailsListScreenNavParams {
  idMailToRemove?: string;
  idMailToRecall?: string;
  idMailToMarkUnread?: string;
  reload?: boolean;
  from?: MailsDefaultFolders | MailsFolderInfo;
  // to manage tabbar visibility when is on select mode
  tabBarVisible?: boolean;
}

export interface MailsListScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'home'>, MailsListScreenProps {}
