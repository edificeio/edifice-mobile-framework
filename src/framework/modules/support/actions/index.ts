import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { actionTypes } from '~/framework/modules/support/reducer';
import { supportService } from '~/framework/modules/support/service';
import workspaceFileTransferActions from '~/framework/modules/workspace/actions/fileTransfer';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const uploadSupportTicketAttachmentsAction =
  (attachments: LocalFile[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(
      workspaceFileTransferActions.uploadFilesAction(attachments, {
        parent: 'protected',
      })
    );
  };

export const supportPostTicketActionsCreators = createAsyncActionCreators(actionTypes.postTicket);
export const postSupportTicketAction =
  (category: string, structure: string, subject: string, description: string, attachments?: SyncedFileWithId[]) =>
  async (dispatch: ThunkDispatch<number | null, any, any>, getState: () => any) => {
    try {
      dispatch(supportPostTicketActionsCreators.request());
      const session = assertSession();
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
