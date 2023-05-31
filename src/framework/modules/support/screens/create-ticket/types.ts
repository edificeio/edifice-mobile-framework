import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { SupportNavigationParams, supportRouteNames } from '~/framework/modules/support/navigation';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';

export interface ISupportCreateTicketScreenDataProps {
  apps: { label: string; value: string }[];
  structures: { label: string; value: string }[];
  session?: ISession;
}

export type SupportScreenNavParams = undefined;

export interface ISupportCreateTicketScreenEventProps {
  postTicket: (category: string, structure: string, subject: string, description: string, attachments?: SyncedFileWithId[]) => any;
  uploadAttachments: (attachments: LocalFile[]) => Promise<SyncedFileWithId[]>;
}

export type ISupportCreateTicketScreenProps = ISupportCreateTicketScreenDataProps &
  ISupportCreateTicketScreenEventProps &
  NativeStackScreenProps<SupportNavigationParams, typeof supportRouteNames.home>;
