import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MailsDefaultFolders, MailsFolderInfo, MailsRecipientInfo, MailsVisible } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export enum MailsEditType {
  REPLY,
  FORWARD,
}

export interface MailsEditScreenProps {
  // @scaffolder add props here
}

export interface MailsEditScreenNavParams {
  initialMailInfo?: {
    id: string;
    body?: string;
    subject?: string;
    from?: MailsRecipientInfo;
    to?: MailsVisible[];
    cc?: MailsVisible[];
    cci?: MailsVisible[];
  };
  type?: MailsEditType;
  fromFolder?: MailsDefaultFolders | MailsFolderInfo;
}

export interface MailsEditScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'edit'>, MailsEditScreenProps {
  // @scaffolder add HOC props here
}
