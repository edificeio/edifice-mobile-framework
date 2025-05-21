import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IMailsFolder, MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsDetailsScreenProps {
  session?: AuthActiveAccount;
}

export interface MailsDetailsScreenNavParams {
  id: string;
  fromFolder: MailsDefaultFolders | MailsFolderInfo;
  folders?: IMailsFolder[];
}

export interface MailsDetailsScreenPrivateProps
  extends NativeStackScreenProps<MailsNavigationParams, 'details'>,
    MailsDetailsScreenProps {}
