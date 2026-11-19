import type { StaticScreenProps } from '@react-navigation/native';

import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler/models';
import { AuthActiveAccount } from '~/modules/auth/model';

export interface ISupportCreateTicketScreenDataProps {
  apps: { label: string; value: string }[];
  structures: { label: string; value: string }[];
  session?: AuthActiveAccount;
}

export type SupportScreenNavParams = undefined;

export interface ISupportCreateTicketScreenEventProps {
  postTicket: (category: string, structure: string, subject: string, description: string, attachments?: SyncedFileWithId[]) => any;
  uploadAttachments: (attachments: LocalFile[]) => Promise<SyncedFileWithId[]>;
}

export type ISupportCreateTicketScreenProps = ISupportCreateTicketScreenDataProps &
  ISupportCreateTicketScreenEventProps &
  StaticScreenProps<SupportScreenNavParams>;
