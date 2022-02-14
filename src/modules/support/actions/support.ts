import { Dispatch } from 'redux';

import { IUserSession } from '~/framework/util/session';
import { progressAction, progressEndAction, progressInitAction } from '~/infra/actions/progress';
import { ITicket } from '~/modules/support/containers/Support';
import { supportService } from '~/modules/support/service/support';

export function createTicketAction(ticket: ITicket) {
  return async (dispatch: Dispatch) => {
    return await supportService.createTicket(ticket);
  };
}

export function addAttachmentAction(file: any, session: IUserSession) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(progressInitAction());
      const handleProgress = progress => dispatch(progressAction(progress));
      const newAttachments = await supportService.addAttachment(file, handleProgress, session);
      dispatch(progressEndAction());
      return newAttachments;
    } catch (errmsg) {
      console.error('ERROR uploading attachment', errmsg);
      dispatch(progressEndAction());
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(attachmentId: string) {
  return async (dispatch: Dispatch) => await supportService.deleteAttachment(attachmentId);
}
