import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { IUserSession } from '~/framework/util/session';

export interface ISupportCreateTicketScreenDataProps {
  apps: { label: string; value: string }[];
  structures: { label: string; value: string }[];
  session: IUserSession;
}

export interface ISupportCreateTicketScreenEventProps {
  postTicket: (category: string, structure: string, subject: string, description: string, attachments?: SyncedFileWithId[]) => any;
  uploadAttachments: (attachments: LocalFile[]) => Promise<SyncedFileWithId[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type ISupportCreateTicketScreenProps = ISupportCreateTicketScreenDataProps &
  ISupportCreateTicketScreenEventProps &
  NavigationInjectedProps;
