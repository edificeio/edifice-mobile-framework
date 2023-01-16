import { ThunkDispatch } from 'redux-thunk';

import workspaceFileTransferActions from '~/framework/modules/workspace/actions/fileTransfer';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { actionTypes } from '~/modules/support/reducer';
import { supportService } from '~/modules/support/service';

export const uploadSupportTicketAttachmentsAction =
  (attachments: LocalFile[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(
      workspaceFileTransferActions.uploadFilesAction(attachments, {
        parent: 'protected',
      }),
    );
  };

export const supportPostTicketActionsCreators = createAsyncActionCreators(actionTypes.postTicket);
export const postSupportTicketAction =
  (category: string, structure: string, subject: string, description: string, attachments?: SyncedFileWithId[]) =>
  async (dispatch: ThunkDispatch<number | null, any, any>, getState: () => any) => {
    try {
      dispatch(supportPostTicketActionsCreators.request());
      const session = getUserSession();
      const id = await supportService.ticket.post(session, category, structure, subject, description, attachments);
      if (!id) {
        const error = new Error('Ticket creation failed');
        dispatch(supportPostTicketActionsCreators.error(error));
        throw error;
      }
      dispatch(supportPostTicketActionsCreators.receipt(id));
      return id;
    } catch (e) {
      dispatch(supportPostTicketActionsCreators.error(e as Error));
      throw e;
    }
  };
