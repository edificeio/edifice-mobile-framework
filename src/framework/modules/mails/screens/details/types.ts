import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export interface MailsDetailsScreenProps {
  // @scaffolder add props here
}

export interface MailsDetailsScreenNavParams {
  from: MailsDefaultFolders | MailsFolderInfo;
}

export interface MailsDetailsScreenPrivateProps
  extends NativeStackScreenProps<MailsNavigationParams, 'details'>,
    MailsDetailsScreenProps {
  // @scaffolder add HOC props here
}
