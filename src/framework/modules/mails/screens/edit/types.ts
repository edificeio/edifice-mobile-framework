import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { UploadedAttachment } from '~/framework/modules/mails/components/attachments/modal-import/types';
import { MailsDefaultFolders, MailsFolderInfo, MailsRecipientInfo, MailsVisible } from '~/framework/modules/mails/model';
import type { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

export enum MailsEditType {
  REPLY,
  FORWARD,
}

export interface MailsEditScreenProps {
  session?: AuthActiveAccount;
}

export interface MailsEditScreenNavParams {
  initialMailInfo?: {
    id: string;
    body?: string;
    subject?: string;
    date?: number;
    from?: MailsRecipientInfo;
    to?: MailsVisible[];
    cc?: MailsVisible[];
    cci?: MailsVisible[];
    attachments?: IDistantFileWithId[];
  };
  draftId?: string;
  type?: MailsEditType;
  fromFolder: MailsDefaultFolders | MailsFolderInfo;
  importAttachmentsResult?: UploadedAttachment[];
}

export interface UseMailsEditControllerParams {
  navigation: NativeStackNavigationProp<MailsNavigationParams, 'edit', undefined>;
  route: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.edit>['route'];
}

export interface MailsEditScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'edit'>, MailsEditScreenProps {
  // @scaffolder add HOC props here
}
