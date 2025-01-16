import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MailsVisible } from '~/framework/modules/mails/model';
import type { MailsNavigationParams } from '~/framework/modules/mails/navigation';

export enum MailsEditType {
  REPLY,
  FORWARD,
}

export interface MailsEditScreenProps {
  // @scaffolder add props here
}

export interface MailsEditScreenNavParams {
  body?: string;
  subject?: string;
  to?: MailsVisible[];
  cc?: MailsVisible[];
  cci?: MailsVisible[];
  type?: MailsEditType;
}

export interface MailsEditScreenPrivateProps extends NativeStackScreenProps<MailsNavigationParams, 'edit'>, MailsEditScreenProps {
  // @scaffolder add HOC props here
}
